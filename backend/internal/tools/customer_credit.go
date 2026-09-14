package tools

import "fmt"

// CustomerCreditTool is a stub executor for the "get_customer_credit_score" tool.
// Full implementation requires a credit score table and customer authentication,
// which do not exist in the current schema. Deferred to a future iteration.
type CustomerCreditTool struct{}

func NewCustomerCreditTool() *CustomerCreditTool { return &CustomerCreditTool{} }

func (t *CustomerCreditTool) Execute(_ map[string]any) (map[string]any, error) {
	return nil, fmt.Errorf("get_customer_credit_score is not yet available in this version; credit score integration is planned for a future release")
}
