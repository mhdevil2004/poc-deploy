package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"

	"LOAN/internal/agent"
	"LOAN/internal/models"
)

// AgentIface allows the handler to be tested without a real LoanAgent.
type AgentIface interface {
	Chat(ctx context.Context, req agent.ChatRequest) (*agent.ChatResponse, error)
}

// AgentHandler handles HTTP requests for the AI agent endpoint.
// It is intentionally thin: decode → validate → delegate → encode.
// No business logic lives here.
type AgentHandler struct {
	agent AgentIface
}

// NewAgentHandler creates a new AgentHandler backed by the given agent.
func NewAgentHandler(a AgentIface) *AgentHandler {
	return &AgentHandler{agent: a}
}

// Chat handles POST /api/v1/agent/chat.
//
// Request body:
//
//	{ "message": "Can I get a loan of 500000?", "customer_id": "optional" }
//
// Response body:
//
//	{ "response": "...", "tool_used": "check_loan_eligibility", "data": {...} }
func (h *AgentHandler) Chat(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeAgentError(w, "Method not allowed. Use POST.", http.StatusMethodNotAllowed)
		return
	}

	// Limit request body to 64 KB to prevent abuse.
	r.Body = http.MaxBytesReader(w, r.Body, 64*1024)

	var req models.AgentChatRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeAgentError(w, "Invalid request body: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Validate the message field.
	req.Message = strings.TrimSpace(req.Message)
	if req.Message == "" {
		writeAgentError(w, "Field 'message' is required and must not be empty.", http.StatusBadRequest)
		return
	}
	if len(req.Message) > 2000 {
		writeAgentError(w, "Field 'message' must not exceed 2000 characters.", http.StatusBadRequest)
		return
	}

	// Sanitise optional customer_id (no SQL constructed from it — it is passed
	// to the LLM as context text only).
	req.CustomerID = strings.TrimSpace(req.CustomerID)

	// Delegate to the agent.
	agentResp, err := h.agent.Chat(r.Context(), agent.ChatRequest{
		Message:    req.Message,
		CustomerID: req.CustomerID,
	})
	if err != nil {
		// Log the internal error but return a generic message to the client
		// so we never leak internal details or API keys.
		writeAgentError(w, "The assistant is temporarily unavailable. Please try again later.", http.StatusInternalServerError)
		return
	}

	// Build the response — only safe, curated fields are returned.
	resp := models.AgentChatResponse{
		Response: agentResp.Response,
		ToolUsed: agentResp.ToolUsed,
		Data:     agentResp.Data,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(resp)
}

// writeAgentError writes a standardised JSON error response for the agent endpoint.
func writeAgentError(w http.ResponseWriter, message string, status int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(map[string]string{"error": message})
}
