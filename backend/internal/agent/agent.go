// Package agent provides the AI orchestration layer for the Loan Credit System.
//
// Architecture:
//
//	HTTP Handler (agent_handler.go)
//	    ↓
//	LoanAgent.Chat()  ←─ this file
//	    ↓
//	Gemini Chat Session (google.golang.org/genai v1.69)
//	    ↓  (returns Part with FunctionCall)
//	toolDispatcher (whitelist-only)
//	    ↓
//	ToolExecutor interface (implemented by internal/tools/)
//	    ↓
//	LoanService methods (pure calc, no DB)
//	    ↓
//	Part{FunctionResponse} → Gemini → Final text
//
// Security invariants:
//   - Only tools explicitly registered in toolMap can be invoked.
//   - The LLM cannot construct arbitrary SQL or call arbitrary functions.
//   - GEMINI_API_KEY is never logged or returned to clients. 
package agent

import (
	"context"
	"fmt"
	"log"
	"os"
	"strings"

	"LOAN/internal/models"
	"google.golang.org/genai"
)

// ─── Interfaces ────────────────────────────────────────────────────────────

// LoanServiceIface is the subset of service.LoanService the agent layer may use.
type LoanServiceIface interface {
	CheckEligibility(amount float64, termMonths int) models.EligibilityResult
	CalculateEMI(principal, annualRate float64, termMonths int) (monthlyPayment, totalPayment float64)
	GetLoanByID(id string) (*models.Loan, error)
}

// ToolExecutor is implemented by every tool in internal/tools/.
type ToolExecutor interface {
	Execute(args map[string]any) (map[string]any, error)
}

// ─── Configuration ─────────────────────────────────────────────────────────

// AgentConfig holds Gemini configuration loaded from env vars.
type AgentConfig struct {
	APIKey string
	Model  string
}

// AgentConfigFromEnv reads GEMINI_API_KEY and GEMINI_MODEL from environment.
func AgentConfigFromEnv() (AgentConfig, error) {
	apiKey := strings.TrimSpace(os.Getenv("GEMINI_API_KEY"))
	if apiKey == "" {
		return AgentConfig{}, fmt.Errorf("GEMINI_API_KEY environment variable is not set")
	}
	model := strings.TrimSpace(os.Getenv("GEMINI_MODEL"))
	if model == "" {
		model = "gemini-3.5-flash-lite"
	}
	return AgentConfig{APIKey: apiKey, Model: model}, nil
}

// ─── Request / Response ────────────────────────────────────────────────────

// ChatRequest is passed to LoanAgent.Chat from the HTTP handler.
type ChatRequest struct {
	Message    string
	CustomerID string
}

// ChatResponse is returned from LoanAgent.Chat to the HTTP handler.
// Only safe, curated fields are included — never raw Gemini internals.
type ChatResponse struct {
	Response string
	ToolUsed string
	Data     map[string]any
}

// ─── Agent ─────────────────────────────────────────────────────────────────

// LoanAgent orchestrates the Gemini multi-turn function-calling loop.
type LoanAgent struct {
	client  *genai.Client
	model   string
	toolMap map[string]ToolExecutor
}

// NewLoanAgent creates and validates a LoanAgent.
func NewLoanAgent(cfg AgentConfig, tools map[string]ToolExecutor) (*LoanAgent, error) {
	if cfg.APIKey == "" {
		return nil, fmt.Errorf("agent: API key is required")
	}
	if len(tools) == 0 {
		return nil, fmt.Errorf("agent: at least one tool executor must be registered")
	}
	ctx := context.Background()
	client, err := genai.NewClient(ctx, &genai.ClientConfig{
		APIKey:  cfg.APIKey,
		Backend: genai.BackendGeminiAPI,
	})
	if err != nil {
		return nil, fmt.Errorf("agent: failed to create Gemini client: %w", err)
	}
	return &LoanAgent{client: client, model: cfg.Model, toolMap: tools}, nil
}

// Chat performs one agentic turn using Gemini's function-calling loop.
// maxToolRounds caps the loop to prevent infinite cycles.
func (a *LoanAgent) Chat(ctx context.Context, req ChatRequest) (*ChatResponse, error) {
	const maxToolRounds = 3

	// Optionally prepend customer context so the LLM has it.
	userMessage := req.Message
	if req.CustomerID != "" {
		userMessage = fmt.Sprintf("[Customer ID: %s] %s", req.CustomerID, req.Message)
	}

	// Build the GenerateContentConfig with system prompt + tools.
	cfg := &genai.GenerateContentConfig{
		SystemInstruction: &genai.Content{
			Parts: []*genai.Part{{Text: SystemPrompt}},
		},
		Tools:       BuildTools(),
		Temperature: genai.Ptr[float32](0.2),
	}

	// Create a fresh chat session per request (stateless from our side).
	session, err := a.client.Chats.Create(ctx, a.model, cfg, nil)
	if err != nil {
		return nil, fmt.Errorf("agent: failed to create chat session: %w", err)
	}

	// Send the first user message.
	resp, err := session.SendMessage(ctx, genai.Part{Text: userMessage})
	if err != nil {
		return nil, fmt.Errorf("agent: Gemini request failed: %w", err)
	}

	var toolUsed string
	var toolData map[string]any

	// Function-call loop (bounded by maxToolRounds).
	for round := 0; round < maxToolRounds; round++ {
		fc := extractFunctionCall(resp)
		if fc == nil {
			break // No function call — Gemini has the final text response.
		}

		toolUsed = fc.Name
		log.Printf("agent: tool requested=%q args=%v", fc.Name, fc.Args)

		// Dispatch through whitelist only.
		result, toolErr := a.dispatchTool(fc.Name, fc.Args)
		if toolErr != nil {
			log.Printf("agent: tool %q error: %v", fc.Name, toolErr)
			result = map[string]any{"error": toolErr.Error()}
		} else {
			toolData = result
		}

		// Send the tool result back to Gemini as a FunctionResponse Part.
		resp, err = session.SendMessage(ctx, genai.Part{
			FunctionResponse: &genai.FunctionResponse{
				Name:     fc.Name,
				Response: result,
			},
		})
		if err != nil {
			return nil, fmt.Errorf("agent: failed to send tool result: %w", err)
		}
	}

	// Extract final natural-language text.
	finalText := extractText(resp)
	if finalText == "" {
		finalText = "I'm sorry, I was unable to process your request. Please try again or contact support."
	}

	return &ChatResponse{
		Response: finalText,
		ToolUsed: toolUsed,
		Data:     toolData,
	}, nil
}

// ─── Private helpers ───────────────────────────────────────────────────────

// dispatchTool executes the named tool if and only if it is in the whitelist.
func (a *LoanAgent) dispatchTool(name string, args map[string]any) (map[string]any, error) {
	executor, ok := a.toolMap[name]
	if !ok {
		return nil, fmt.Errorf("tool %q is not registered", name)
	}
	return executor.Execute(args)
}

// extractFunctionCall returns the first FunctionCall found in the response, or nil.
func extractFunctionCall(resp *genai.GenerateContentResponse) *genai.FunctionCall {
	if resp == nil || len(resp.Candidates) == 0 {
		return nil
	}
	c := resp.Candidates[0]
	if c.Content == nil {
		return nil
	}
	for _, part := range c.Content.Parts {
		if part != nil && part.FunctionCall != nil {
			return part.FunctionCall
		}
	}
	return nil
}

// extractText joins all Text parts from the first candidate.
func extractText(resp *genai.GenerateContentResponse) string {
	if resp == nil || len(resp.Candidates) == 0 {
		return ""
	}
	c := resp.Candidates[0]
	if c.Content == nil {
		return ""
	}
	var sb strings.Builder
	for _, part := range c.Content.Parts {
		if part != nil && part.Text != "" {
			sb.WriteString(part.Text)
		}
	}
	return strings.TrimSpace(sb.String())
}
