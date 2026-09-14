package agent_test

import (
	"testing"

	"LOAN/internal/agent"
)

// ─── AgentConfigFromEnv tests ──────────────────────────────────────────────

func TestAgentConfigFromEnv_MissingAPIKey(t *testing.T) {
	t.Setenv("GEMINI_API_KEY", "")
	_, err := agent.AgentConfigFromEnv()
	if err == nil {
		t.Fatal("expected error when GEMINI_API_KEY is empty, got nil")
	}
}

func TestAgentConfigFromEnv_ValidKey(t *testing.T) {
	t.Setenv("GEMINI_API_KEY", "test-api-key-123")
	t.Setenv("GEMINI_MODEL", "")

	cfg, err := agent.AgentConfigFromEnv()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if cfg.APIKey != "test-api-key-123" {
		t.Errorf("expected APIKey=test-api-key-123, got %q", cfg.APIKey)
	}
	// Default model should be used when GEMINI_MODEL is empty.
	if cfg.Model == "" {
		t.Error("expected a non-empty default model")
	}
}

func TestAgentConfigFromEnv_CustomModel(t *testing.T) {
	t.Setenv("GEMINI_API_KEY", "test-api-key-123")
	t.Setenv("GEMINI_MODEL", "gemini-1.5-pro")

	cfg, err := agent.AgentConfigFromEnv()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if cfg.Model != "gemini-1.5-pro" {
		t.Errorf("expected model=gemini-1.5-pro, got %q", cfg.Model)
	}
}

func TestAgentConfigFromEnv_WhitespaceAPIKey(t *testing.T) {
	t.Setenv("GEMINI_API_KEY", "   ")
	_, err := agent.AgentConfigFromEnv()
	if err == nil {
		t.Fatal("expected error when GEMINI_API_KEY is whitespace-only, got nil")
	}
}

// ─── NewLoanAgent validation tests ────────────────────────────────────────
// These do NOT make real API calls. We test that NewLoanAgent rejects
// invalid configuration early, before any network connection is made.

func TestNewLoanAgent_EmptyAPIKey(t *testing.T) {
	cfg := agent.AgentConfig{APIKey: "", Model: "gemini-2.0-flash-lite"}
	_, err := agent.NewLoanAgent(cfg, map[string]agent.ToolExecutor{
		"dummy": &dummyTool{},
	})
	if err == nil {
		t.Fatal("expected error for empty APIKey, got nil")
	}
}

func TestNewLoanAgent_NoTools(t *testing.T) {
	cfg := agent.AgentConfig{APIKey: "test-key", Model: "gemini-2.0-flash-lite"}
	_, err := agent.NewLoanAgent(cfg, map[string]agent.ToolExecutor{})
	if err == nil {
		t.Fatal("expected error for empty tool registry, got nil")
	}
}

// ─── Tool registration test ────────────────────────────────────────────────

// dummyTool is a minimal no-op ToolExecutor for wiring tests.
type dummyTool struct{}

func (d *dummyTool) Execute(_ map[string]any) (map[string]any, error) {
	return map[string]any{"ok": true}, nil
}
