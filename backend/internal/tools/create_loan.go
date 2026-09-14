package tools

import (
	"fmt"

	"LOAN/internal/models"
)

type CreateLoanServiceIface interface {
	CreateLoan(req models.LoanRequest) (*models.Loan, error)
}

type CreateLoanTool struct {
	svc CreateLoanServiceIface
}

func NewCreateLoanTool(svc CreateLoanServiceIface) *CreateLoanTool {
	return &CreateLoanTool{svc: svc}
}

func (t *CreateLoanTool) Execute(args map[string]any) (map[string]any, error) {
	rawAmount, ok := args["amount"]
	if !ok {
		return nil, fmt.Errorf("missing required argument: amount")
	}
	amount, err := toFloat64(rawAmount)
	if err != nil {
		return nil, fmt.Errorf("invalid argument 'amount': %w", err)
	}

	rawTerm, ok := args["term_months"]
	if !ok {
		return nil, fmt.Errorf("missing required argument: term_months")
	}
	termFloat, err := toFloat64(rawTerm)
	if err != nil {
		return nil, fmt.Errorf("invalid argument 'term_months': %w", err)
	}
	termMonths := int(termFloat)

	rawName, ok := args["applicant_name"]
	if !ok {
		return nil, fmt.Errorf("missing required argument: applicant_name")
	}
	applicantName, ok := rawName.(string)
	if !ok {
		return nil, fmt.Errorf("invalid argument 'applicant_name': must be a string")
	}

	rawEmail, ok := args["email"]
	if !ok {
		return nil, fmt.Errorf("missing required argument: email")
	}
	email, ok := rawEmail.(string)
	if !ok {
		return nil, fmt.Errorf("invalid argument 'email': must be a string")
	}

	req := models.LoanRequest{
		ApplicantName: applicantName,
		Email:         email,
		Amount:        amount,
		TermMonths:    termMonths,
	}

	loan, err := t.svc.CreateLoan(req)
	if err != nil {
		return nil, err
	}

	return map[string]any{
		"success": true,
		"loan_id": loan.ID,
		"status":  loan.Status,
		"message": "Loan application created successfully",
	}, nil
}
