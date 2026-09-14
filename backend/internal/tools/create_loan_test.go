package tools_test

import (
	"LOAN/internal/models"
	"LOAN/internal/tools"
	"fmt"
	"testing"
)

type mockCreateLoanService struct {
	ShouldFail bool
	CreatedReq models.LoanRequest
}

func (m *mockCreateLoanService) CreateLoan(req models.LoanRequest) (*models.Loan, error) {
	if m.ShouldFail {
		return nil, fmt.Errorf("database failure")
	}
	m.CreatedReq = req
	return &models.Loan{
		ID:     "mock-id",
		Status: "pending",
	}, nil
}

func TestCreateLoanTool_Success(t *testing.T) {
	mockSvc := &mockCreateLoanService{}
	tool := tools.NewCreateLoanTool(mockSvc)

	args := map[string]any{
		"amount":         100000.0,
		"term_months":    36.0,
		"applicant_name": "Test User",
		"email":          "test@example.com",
	}

	result, err := tool.Execute(args)
	if err != nil {
		t.Fatalf("expected no error, got: %v", err)
	}

	if result["success"] != true {
		t.Errorf("expected success: true, got: %v", result["success"])
	}

	if mockSvc.CreatedReq.ApplicantName != "Test User" {
		t.Errorf("expected ApplicantName 'Test User', got %q", mockSvc.CreatedReq.ApplicantName)
	}
}

func TestCreateLoanTool_DatabaseFailure(t *testing.T) {
	mockSvc := &mockCreateLoanService{ShouldFail: true}
	tool := tools.NewCreateLoanTool(mockSvc)

	args := map[string]any{
		"amount":         100000.0,
		"term_months":    36.0,
		"applicant_name": "Test User",
		"email":          "test@example.com",
	}

	_, err := tool.Execute(args)
	if err == nil {
		t.Fatal("expected error on database failure, got none")
	}
}
