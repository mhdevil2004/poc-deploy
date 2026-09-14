// Package tools contains the concrete executor implementations for each
// agent tool. Every executor implements the agent.ToolExecutor interface:
//
//	Execute(args map[string]any) (map[string]any, error)
//
// Tools call ONLY service-layer methods — never repositories or SQL directly.
// This file implements the check_loan_eligibility tool.
package tools

import (
	"fmt"

	"LOAN/internal/models"
)

// EligibilityServiceIface is the subset of LoanService that EligibilityTool needs.
// Using an interface makes the tool independently testable.
type EligibilityServiceIface interface {
	CheckEligibility(amount float64, termMonths int) models.EligibilityResult
}

// EligibilityTool implements agent.ToolExecutor for the "check_loan_eligibility" function.
// It delegates ALL business logic to LoanService.CheckEligibility — the LLM's role
// is only to extract the arguments from the user's natural-language request.
type EligibilityTool struct {
	svc EligibilityServiceIface
}

// NewEligibilityTool creates a new EligibilityTool backed by the given service.
func NewEligibilityTool(svc EligibilityServiceIface) *EligibilityTool {
	return &EligibilityTool{svc: svc}
}

// Execute validates the arguments supplied by Gemini, calls the service, and
// returns the structured eligibility result. It never touches the database.
//
// Expected args:
//   - "amount"      float64 — requested loan amount in ₹
//   - "term_months" int/float64 — repayment term in months (Gemini may send float)
func (t *EligibilityTool) Execute(args map[string]any) (map[string]any, error) {
	// ── Validate and extract "amount" ──────────────────────────────────────
	rawAmount, ok := args["amount"]
	if !ok {
		return nil, fmt.Errorf("missing required argument: amount")
	}
	amount, err := toFloat64(rawAmount)
	if err != nil {
		return nil, fmt.Errorf("invalid argument 'amount': %w", err)
	}
	if amount <= 0 {
		return nil, fmt.Errorf("argument 'amount' must be greater than 0, got %.2f", amount)
	}

	// ── Validate and extract "term_months" ────────────────────────────────
	rawTerm, ok := args["term_months"]
	if !ok {
		return nil, fmt.Errorf("missing required argument: term_months")
	}
	termFloat, err := toFloat64(rawTerm)
	if err != nil {
		return nil, fmt.Errorf("invalid argument 'term_months': %w", err)
	}
	termMonths := int(termFloat)
	if termMonths <= 0 || termMonths > 84 {
		return nil, fmt.Errorf("argument 'term_months' must be between 1 and 84, got %d", termMonths)
	}

	// ── Delegate to the service layer (pure calculation, no DB) ───────────
	result := t.svc.CheckEligibility(amount, termMonths)

	// ── Serialise the EligibilityResult to map[string]any for Gemini ──────
	return eligibilityResultToMap(result), nil
}

// eligibilityResultToMap converts an EligibilityResult struct to the
// map[string]any format expected by Gemini's FunctionResponse.
func eligibilityResultToMap(r models.EligibilityResult) map[string]any {
	m := map[string]any{
		"eligible":         r.Eligible,
		"reason":           r.Reason,
		"requested_amount": r.RequestedAmount,
		"term_months":      r.TermMonths,
	}
	if r.Eligible {
		m["interest_rate"] = r.InterestRate
		m["estimated_monthly_payment"] = r.EstimatedMonthlyPayment
		m["estimated_total_payment"] = r.EstimatedTotalPayment
	}
	return m
}

// toFloat64 safely converts common JSON-decoded numeric types to float64.
// Gemini may send integer arguments as float64 due to JSON encoding.
func toFloat64(v any) (float64, error) {
	switch n := v.(type) {
	case float64:
		return n, nil
	case float32:
		return float64(n), nil
	case int:
		return float64(n), nil
	case int32:
		return float64(n), nil
	case int64:
		return float64(n), nil
	default:
		return 0, fmt.Errorf("expected a number, got %T", v)
	}
}
