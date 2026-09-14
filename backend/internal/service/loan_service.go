package service

import (
	"LOAN/internal/models"
	"LOAN/internal/repository"
	"fmt"
	"math"
)

type LoanService struct {
	repo *repository.LoanRepository
}

func NewLoanService(repo *repository.LoanRepository) *LoanService {
	return &LoanService{repo: repo}
}

// CreateLoan processes a new loan application
func (s *LoanService) CreateLoan(req models.LoanRequest) (*models.Loan, error) {
	// Business logic: Calculate interest rate based on amount and term
	interestRate := s.calculateInterestRate(req.Amount, req.TermMonths)

	// Calculate monthly payment
	monthlyPayment := s.calculateMonthlyPayment(req.Amount, interestRate, req.TermMonths)
	totalPayment := monthlyPayment * float64(req.TermMonths)

	// Create loan object
	loan := models.NewLoan(req, monthlyPayment, totalPayment, interestRate)

	// Save to database
	err := s.repo.Create(loan)
	if err != nil {
		return nil, err
	}

	return loan, nil
}

// GetAllLoans retrieves all loans
func (s *LoanService) GetAllLoans() ([]models.Loan, error) {
	return s.repo.GetAll()
}

// GetLoanByID retrieves a loan by ID
func (s *LoanService) GetLoanByID(id string) (*models.Loan, error) {
	return s.repo.GetByID(id)
}

// UpdateLoan updates editable loan details and recalculates payments.
func (s *LoanService) UpdateLoan(id string, req models.UpdateLoanDetailsRequest) (*models.Loan, error) {
	loan, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}

	interestRate := s.calculateInterestRate(req.Amount, req.TermMonths)
	monthlyPayment := s.calculateMonthlyPayment(req.Amount, interestRate, req.TermMonths)

	loan.ApplicantName = req.ApplicantName
	loan.Email = req.Email
	loan.Amount = req.Amount
	loan.TermMonths = req.TermMonths
	loan.InterestRate = interestRate
	loan.MonthlyPayment = monthlyPayment
	loan.TotalPayment = monthlyPayment * float64(req.TermMonths)

	if err := s.repo.Update(loan); err != nil {
		return nil, err
	}

	return s.repo.GetByID(id)
}

// ApproveLoan approves a loan
func (s *LoanService) ApproveLoan(id string) (*models.Loan, error) {
	loan, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}

	// Business logic: Check if loan can be approved
	if err := s.validateLoanForApproval(loan); err != nil {
		return nil, err
	}

	err = s.repo.UpdateStatus(id, "approved")
	if err != nil {
		return nil, err
	}

	return s.repo.GetByID(id)
}

// RejectLoan rejects a loan
func (s *LoanService) RejectLoan(id string) (*models.Loan, error) {
	err := s.repo.UpdateStatus(id, "rejected")
	if err != nil {
		return nil, err
	}
	return s.repo.GetByID(id)
}

// DeleteLoan deletes a loan
func (s *LoanService) DeleteLoan(id string) error {
	return s.repo.Delete(id)
}

// Private helper methods

func (s *LoanService) calculateInterestRate(amount float64, termMonths int) float64 {
	// Business logic: Risk-based interest rate
	if amount > 100000 {
		return 8.5 // Higher risk for large loans
	}
	if termMonths > 36 {
		return 9.0 // Higher risk for longer terms
	}
	return 7.5 // Default rate
}

func (s *LoanService) calculateMonthlyPayment(principal, annualRate float64, months int) float64 {
	if annualRate == 0 {
		return principal / float64(months)
	}

	monthlyRate := annualRate / 100 / 12
	// EMI = P * r * (1+r)^n / ((1+r)^n - 1)
	numerator := principal * monthlyRate * math.Pow(1+monthlyRate, float64(months))
	denominator := math.Pow(1+monthlyRate, float64(months)) - 1
	return numerator / denominator
}

func (s *LoanService) validateLoanForApproval(loan *models.Loan) error {
	// Business logic: Validate loan conditions
	if loan.Status != "pending" {
		return fmt.Errorf("loan is not in pending state, current status: %s", loan.Status)
	}

	// Check if loan amount is within limits
	if loan.Amount > 1000000 {
		return fmt.Errorf("loan amount exceeds maximum limit")
	}

	return nil
}

// ─── Agent-facing methods ─────────────────────────────────────────────────
// These methods are PURE CALCULATIONS — no database access.
// They are called exclusively by the agent tool layer, never by handlers.

// CheckEligibility evaluates whether a loan can be granted based on the
// requested amount and term. It reuses the existing private business-logic
// helpers so eligibility rules remain the single source of truth in the
// service layer, not in the LLM.
func (s *LoanService) CheckEligibility(amount float64, termMonths int) models.EligibilityResult {
	// --- Validation guards ---
	if amount <= 0 {
		return models.EligibilityResult{
			Eligible:        false,
			Reason:          "Loan amount must be greater than zero.",
			RequestedAmount: amount,
			TermMonths:      termMonths,
		}
	}
	if termMonths <= 0 || termMonths > 84 {
		return models.EligibilityResult{
			Eligible:        false,
			Reason:          "Loan term must be between 1 and 84 months.",
			RequestedAmount: amount,
			TermMonths:      termMonths,
		}
	}

	// --- Existing business rule: maximum loan amount ---
	if amount > 1_000_000 {
		return models.EligibilityResult{
			Eligible:        false,
			Reason:          "Loan amount exceeds the maximum allowed limit of ₹10,00,000.",
			RequestedAmount: amount,
			TermMonths:      termMonths,
		}
	}

	// --- Reuse existing private helpers for rate and payment ---
	rate := s.calculateInterestRate(amount, termMonths)
	monthly := s.calculateMonthlyPayment(amount, rate, termMonths)
	total := monthly * float64(termMonths)

	return models.EligibilityResult{
		Eligible:                true,
		Reason:                  "Your loan request meets all eligibility criteria.",
		RequestedAmount:         amount,
		TermMonths:              termMonths,
		InterestRate:            rate,
		EstimatedMonthlyPayment: math.Round(monthly*100) / 100,
		EstimatedTotalPayment:   math.Round(total*100) / 100,
	}
}

// CalculateEMI returns the monthly payment and total payment for a given
// principal, annual interest rate, and term. This is a pure calculation
// exposed for the calculate_emi agent tool.
func (s *LoanService) CalculateEMI(principal, annualRate float64, termMonths int) (monthlyPayment, totalPayment float64) {
	monthly := s.calculateMonthlyPayment(principal, annualRate, termMonths)
	return math.Round(monthly*100) / 100, math.Round(monthly*float64(termMonths)*100) / 100
}
