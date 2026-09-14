package tools

import "fmt"

// EMITool is a stub executor for the "calculate_emi" tool.
// It is declared in agent/tools.go so the LLM knows the capability exists,
// but the full implementation (with database-backed rate lookup) is deferred
// to a future iteration.
//
// To implement: replace this stub with a real EligibilityServiceIface call
// and wire it up in main.go alongside EligibilityTool.
type EMITool struct{}

func NewEMITool() *EMITool { return &EMITool{} }

func (t *EMITool) Execute(_ map[string]any) (map[string]any, error) {
	return nil, fmt.Errorf("calculate_emi is not yet available in this version; please use check_loan_eligibility for payment estimates")
}
