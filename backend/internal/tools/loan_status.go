package tools

import "fmt"

// LoanStatusTool is a stub executor for the "get_loan_status" tool.
// Full implementation requires an authenticated loan ID lookup via LoanService.GetLoanByID.
// Deferred to a future iteration once agent authentication is in place.
type LoanStatusTool struct{}

func NewLoanStatusTool() *LoanStatusTool { return &LoanStatusTool{} }

func (t *LoanStatusTool) Execute(_ map[string]any) (map[string]any, error) {
	return nil, fmt.Errorf("get_loan_status is not yet available in this version; please check your loan status through the Fintillaa portal")
}
