package handlers_test

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"LOAN/internal/agent"
	"LOAN/internal/handlers"
)

// ─── Mock agent ────────────────────────────────────────────────────────────

type mockAgent struct {
	response *agent.ChatResponse
	err      error
}

func (m *mockAgent) Chat(_ context.Context, req agent.ChatRequest) (*agent.ChatResponse, error) {
	return m.response, m.err
}

// ─── Helpers ───────────────────────────────────────────────────────────────

func postChat(t *testing.T, h *handlers.AgentHandler, body string) *httptest.ResponseRecorder {
	t.Helper()
	req := httptest.NewRequest(http.MethodPost, "/api/v1/agent/chat", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	h.Chat(w, req)
	return w
}

// ─── Tests ─────────────────────────────────────────────────────────────────

func TestAgentHandler_MethodNotAllowed(t *testing.T) {
	h := handlers.NewAgentHandler(&mockAgent{})
	req := httptest.NewRequest(http.MethodGet, "/api/v1/agent/chat", nil)
	w := httptest.NewRecorder()
	h.Chat(w, req)

	if w.Code != http.StatusMethodNotAllowed {
		t.Errorf("expected 405, got %d", w.Code)
	}
}

func TestAgentHandler_EmptyBody(t *testing.T) {
	h := handlers.NewAgentHandler(&mockAgent{})
	w := postChat(t, h, `{}`)

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected 400 for empty message, got %d", w.Code)
	}
}

func TestAgentHandler_WhitespaceMessage(t *testing.T) {
	h := handlers.NewAgentHandler(&mockAgent{})
	w := postChat(t, h, `{"message": "   "}`)

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected 400 for whitespace-only message, got %d", w.Code)
	}
}

func TestAgentHandler_MessageTooLong(t *testing.T) {
	longMsg := make([]byte, 2001)
	for i := range longMsg {
		longMsg[i] = 'a'
	}
	body := `{"message":"` + string(longMsg) + `"}`
	h := handlers.NewAgentHandler(&mockAgent{})
	w := postChat(t, h, body)

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected 400 for message > 2000 chars, got %d", w.Code)
	}
}

func TestAgentHandler_InvalidJSON(t *testing.T) {
	h := handlers.NewAgentHandler(&mockAgent{})
	w := postChat(t, h, `{not-valid-json`)

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected 400 for invalid JSON, got %d", w.Code)
	}
}

func TestAgentHandler_AgentError(t *testing.T) {
	h := handlers.NewAgentHandler(&mockAgent{err: errAgentFailed})
	w := postChat(t, h, `{"message":"Can I get a loan?"}`)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("expected 500 when agent returns error, got %d", w.Code)
	}

	// Ensure the internal error is NOT exposed in the response body.
	body := w.Body.String()
	if contains(body, "agent failed") {
		t.Error("internal error detail should not be exposed to the client")
	}
}

func TestAgentHandler_SuccessfulResponse(t *testing.T) {
	fakeResp := &agent.ChatResponse{
		Response: "You are eligible for a loan of ₹5,00,000.",
		ToolUsed: "check_loan_eligibility",
		Data: map[string]any{
			"eligible":     true,
			"interest_rate": 8.5,
		},
	}
	h := handlers.NewAgentHandler(&mockAgent{response: fakeResp})
	w := postChat(t, h, `{"message":"Can I get a loan of 500000?"}`)

	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}

	var decoded map[string]any
	if err := json.Unmarshal(w.Body.Bytes(), &decoded); err != nil {
		t.Fatalf("response is not valid JSON: %v", err)
	}

	if decoded["response"] != fakeResp.Response {
		t.Errorf("expected response=%q, got %q", fakeResp.Response, decoded["response"])
	}
	if decoded["tool_used"] != fakeResp.ToolUsed {
		t.Errorf("expected tool_used=%q, got %q", fakeResp.ToolUsed, decoded["tool_used"])
	}
}

func TestAgentHandler_ContentTypeIsJSON(t *testing.T) {
	fakeResp := &agent.ChatResponse{Response: "Hello"}
	h := handlers.NewAgentHandler(&mockAgent{response: fakeResp})
	w := postChat(t, h, `{"message":"Hello"}`)

	ct := w.Header().Get("Content-Type")
	if ct != "application/json" {
		t.Errorf("expected Content-Type application/json, got %q", ct)
	}
}

// ─── Helpers ───────────────────────────────────────────────────────────────

type testError string

func (e testError) Error() string { return string(e) }

var errAgentFailed = testError("agent failed: simulated error")

func contains(s, substr string) bool {
	return len(s) >= len(substr) && (s == substr || len(substr) == 0 ||
		func() bool {
			for i := 0; i <= len(s)-len(substr); i++ {
				if s[i:i+len(substr)] == substr {
					return true
				}
			}
			return false
		}())
}
