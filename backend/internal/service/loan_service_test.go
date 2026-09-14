package service_test

import (
	"testing"

	"LOAN/internal/service"
	"LOAN/internal/repository"
	"database/sql"
)

// ─── Pure Calculation Tests (no DB required) ───────────────────────────────
// These tests exercise LoanService.CheckEligibility which is a pure function
// that calls private helpers — no repository interaction at all.

func newServiceWithNilRepo() *service.LoanService {
	// CheckEligibility and CalculateEMI are pure calculations — they never call
	// the repository, so it's safe to pass a LoanRepository backed by a nil DB.
	repo := repository.NewLoanRepository((*sql.DB)(nil))
	return service.NewLoanService(repo)
}

func TestCheckEligibility_EligibleLargeAmount(t *testing.T) {
	svc := newServiceWithNilRepo()
	result := svc.CheckEligibility(500_000, 24)

	if !result.Eligible {
		t.Errorf("expected eligible=true for 500,000 / 24 months, got false: %s", result.Reason)
	}
	// Business rule: amount > 100,000 → 8.5%
	if result.InterestRate != 8.5 {
		t.Errorf("expected interest_rate=8.5 for amount 500,000, got %.2f", result.InterestRate)
	}
	if result.EstimatedMonthlyPayment <= 0 {
		t.Error("expected positive monthly payment")
	}
}

func TestCheckEligibility_EligibleSmallAmount(t *testing.T) {
	svc := newServiceWithNilRepo()
	result := svc.CheckEligibility(50_000, 24)

	if !result.Eligible {
		t.Errorf("expected eligible=true for 50,000 / 24 months, got false: %s", result.Reason)
	}
	// Business rule: amount <= 100,000 AND term <= 36 → 7.5%
	if result.InterestRate != 7.5 {
		t.Errorf("expected interest_rate=7.5 for amount 50,000, got %.2f", result.InterestRate)
	}
}

func TestCheckEligibility_LongTermRate(t *testing.T) {
	svc := newServiceWithNilRepo()
	// term_months > 36 and amount <= 100,000 → 9.0%
	result := svc.CheckEligibility(80_000, 48)

	if !result.Eligible {
		t.Errorf("expected eligible=true for 80,000 / 48 months, got false: %s", result.Reason)
	}
	if result.InterestRate != 9.0 {
		t.Errorf("expected interest_rate=9.0 for term 48, got %.2f", result.InterestRate)
	}
}

func TestCheckEligibility_ExceedsMaxAmount(t *testing.T) {
	svc := newServiceWithNilRepo()
	result := svc.CheckEligibility(1_500_000, 24)

	if result.Eligible {
		t.Error("expected eligible=false for amount exceeding 1,000,000")
	}
}

func TestCheckEligibility_ZeroAmount(t *testing.T) {
	svc := newServiceWithNilRepo()
	result := svc.CheckEligibility(0, 24)

	if result.Eligible {
		t.Error("expected eligible=false for amount=0")
	}
}

func TestCheckEligibility_InvalidTerm(t *testing.T) {
	svc := newServiceWithNilRepo()

	for _, term := range []int{0, -1, 85, 200} {
		result := svc.CheckEligibility(500_000, term)
		if result.Eligible {
			t.Errorf("expected eligible=false for term=%d, got true", term)
		}
	}
}

func TestCheckEligibility_BoundaryAmount(t *testing.T) {
	svc := newServiceWithNilRepo()

	// Exactly at the limit: 1,000,000 should be eligible.
	result := svc.CheckEligibility(1_000_000, 24)
	if !result.Eligible {
		t.Errorf("expected eligible=true for amount=1,000,000 (boundary), got false: %s", result.Reason)
	}

	// One Rp over the limit: should be ineligible.
	result = svc.CheckEligibility(1_000_001, 24)
	if result.Eligible {
		t.Error("expected eligible=false for amount=1,000,001 (over boundary)")
	}
}

func TestCalculateEMI_BasicMath(t *testing.T) {
	svc := newServiceWithNilRepo()
	monthly, total := svc.CalculateEMI(100_000, 7.5, 12)

	if monthly <= 0 {
		t.Error("expected positive monthly payment")
	}
	// Total should equal monthly * term (rounded).
	expected := monthly * 12
	if total != expected {
		// Allow for rounding difference of at most 1 Rp.
		diff := total - expected
		if diff < -1 || diff > 1 {
			t.Errorf("total=%.2f does not match monthly*12=%.2f", total, expected)
		}
	}
}

func TestCalculateEMI_ZeroRate(t *testing.T) {
	svc := newServiceWithNilRepo()
	monthly, total := svc.CalculateEMI(120_000, 0, 12)

	// Zero rate: monthly should be principal / months.
	if monthly != 10_000 {
		t.Errorf("expected monthly=10000 for zero rate, got %.2f", monthly)
	}
	_ = total
}
