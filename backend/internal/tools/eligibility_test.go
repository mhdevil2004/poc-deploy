package tools_test

import (
	"testing"

	"LOAN/internal/models"
	"LOAN/internal/tools"
)

// ─── Mock service ──────────────────────────────────────────────────────────

type mockEligibilitySvc struct {
	result models.EligibilityResult
}

func (m *mockEligibilitySvc) CheckEligibility(amount float64, termMonths int) models.EligibilityResult {
	// Store what we were called with so tests can inspect it.
	m.result.RequestedAmount = amount
	m.result.TermMonths = termMonths
	// Return preset result (set in each test).
	return m.result
}

// ─── Helpers ───────────────────────────────────────────────────────────────

func newEligibleSvc() *mockEligibilitySvc {
	return &mockEligibilitySvc{
		result: models.EligibilityResult{
			Eligible:                true,
			Reason:                  "Your loan request meets all eligibility criteria.",
			InterestRate:            8.5,
			EstimatedMonthlyPayment: 5000.00,
			EstimatedTotalPayment:   180000.00,
		},
	}
}

func newIneligibleSvc(reason string) *mockEligibilitySvc {
	return &mockEligibilitySvc{
		result: models.EligibilityResult{
			Eligible: false,
			Reason:   reason,
		},
	}
}

// ─── Tests ─────────────────────────────────────────────────────────────────

func TestEligibilityTool_MissingAmount(t *testing.T) {
	tool := tools.NewEligibilityTool(newEligibleSvc())
	_, err := tool.Execute(map[string]any{
		"term_months": float64(24),
	})
	if err == nil {
		t.Fatal("expected error for missing 'amount', got nil")
	}
}

func TestEligibilityTool_MissingTermMonths(t *testing.T) {
	tool := tools.NewEligibilityTool(newEligibleSvc())
	_, err := tool.Execute(map[string]any{
		"amount": float64(500000),
	})
	if err == nil {
		t.Fatal("expected error for missing 'term_months', got nil")
	}
}

func TestEligibilityTool_ZeroAmount(t *testing.T) {
	tool := tools.NewEligibilityTool(newEligibleSvc())
	_, err := tool.Execute(map[string]any{
		"amount":      float64(0),
		"term_months": float64(24),
	})
	if err == nil {
		t.Fatal("expected error for amount = 0, got nil")
	}
}

func TestEligibilityTool_NegativeAmount(t *testing.T) {
	tool := tools.NewEligibilityTool(newEligibleSvc())
	_, err := tool.Execute(map[string]any{
		"amount":      float64(-1000),
		"term_months": float64(24),
	})
	if err == nil {
		t.Fatal("expected error for negative amount, got nil")
	}
}

func TestEligibilityTool_InvalidTermZero(t *testing.T) {
	tool := tools.NewEligibilityTool(newEligibleSvc())
	_, err := tool.Execute(map[string]any{
		"amount":      float64(500000),
		"term_months": float64(0),
	})
	if err == nil {
		t.Fatal("expected error for term_months = 0, got nil")
	}
}

func TestEligibilityTool_InvalidTermTooLarge(t *testing.T) {
	tool := tools.NewEligibilityTool(newEligibleSvc())
	_, err := tool.Execute(map[string]any{
		"amount":      float64(500000),
		"term_months": float64(200),
	})
	if err == nil {
		t.Fatal("expected error for term_months = 200, got nil")
	}
}

func TestEligibilityTool_WrongTypesForArgs(t *testing.T) {
	tool := tools.NewEligibilityTool(newEligibleSvc())
	_, err := tool.Execute(map[string]any{
		"amount":      "five-hundred-thousand", // wrong type
		"term_months": float64(24),
	})
	if err == nil {
		t.Fatal("expected error for string amount, got nil")
	}
}

func TestEligibilityTool_EligibleCase(t *testing.T) {
	svc := newEligibleSvc()
	tool := tools.NewEligibilityTool(svc)

	result, err := tool.Execute(map[string]any{
		"amount":      float64(500000),
		"term_months": float64(24),
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	eligible, ok := result["eligible"].(bool)
	if !ok || !eligible {
		t.Errorf("expected eligible=true, got %v", result["eligible"])
	}

	// When eligible, these fields must be present.
	for _, key := range []string{"interest_rate", "estimated_monthly_payment", "estimated_total_payment"} {
		if _, exists := result[key]; !exists {
			t.Errorf("expected key %q in eligible result, but it was missing", key)
		}
	}
}

func TestEligibilityTool_IneligibleCase(t *testing.T) {
	const reason = "Loan amount exceeds the maximum allowed limit."
	svc := newIneligibleSvc(reason)
	tool := tools.NewEligibilityTool(svc)

	result, err := tool.Execute(map[string]any{
		"amount":      float64(2_000_000),
		"term_months": float64(24),
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	eligible, ok := result["eligible"].(bool)
	if !ok || eligible {
		t.Errorf("expected eligible=false, got %v", result["eligible"])
	}

	// When ineligible, payment fields must NOT be present.
	for _, key := range []string{"interest_rate", "estimated_monthly_payment", "estimated_total_payment"} {
		if _, exists := result[key]; exists {
			t.Errorf("unexpected key %q in ineligible result", key)
		}
	}
}

func TestEligibilityTool_GeminiSendsFloatForTermMonths(t *testing.T) {
	// Gemini typically sends integer arguments as float64 due to JSON encoding.
	// This test confirms toFloat64 handles that gracefully.
	svc := newEligibleSvc()
	tool := tools.NewEligibilityTool(svc)

	_, err := tool.Execute(map[string]any{
		"amount":      float64(300000),
		"term_months": float64(36), // float64 not int
	})
	if err != nil {
		t.Fatalf("expected no error when term_months is float64(36), got: %v", err)
	}
}
