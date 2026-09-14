package agent

import "google.golang.org/genai"

// BuildTools returns the Gemini tool definitions that this agent is allowed to call.
// Only functions declared here can ever be invoked by the LLM — the dispatcher in
// agent.go enforces this by checking the toolMap registry.
//
// To add a new capability:
//  1. Add a FunctionDeclaration here.
//  2. Implement the tool in internal/tools/<name>.go.
//  3. Register it in NewLoanAgent() inside agent.go.
func BuildTools() []*genai.Tool {
	return []*genai.Tool{
		{
			FunctionDeclarations: []*genai.FunctionDeclaration{
				checkLoanEligibilityDecl(),
				calculateEMIDecl(),
				getLoanStatusDecl(),
				getCustomerCreditScoreDecl(),
				createLoanApplicationDecl(),
			},
		},
	}
}

// checkLoanEligibilityDecl declares the schema for the check_loan_eligibility tool.
// The LLM uses this description to decide WHEN to invoke the tool and WHICH
// arguments to supply.  The actual calculation is in internal/tools/eligibility.go.
func checkLoanEligibilityDecl() *genai.FunctionDeclaration {
	return &genai.FunctionDeclaration{
		Name:        "check_loan_eligibility",
		Description: "Check whether a loan request can be approved based on the bank's lending rules. Returns eligibility status, applicable interest rate, and estimated monthly and total payments. Always call this tool when the user asks about getting a loan, qualifying for a loan, or loan eligibility.",
		Parameters: &genai.Schema{
			Type: genai.TypeObject,
			Properties: map[string]*genai.Schema{
				"amount": {
					Type:        genai.TypeNumber,
					Description: "The requested loan amount in Indian Rps (₹). Must be greater than 0 and at most 10,00,000.",
				},
				"term_months": {
					Type:        genai.TypeInteger,
					Description: "Loan repayment term in months. Valid range: 1 to 84 months. If not specified by the user, use 36.",
				},
			},
			Required: []string{"amount", "term_months"},
		},
	}
}

// calculateEMIDecl declares the schema for the calculate_emi tool.
// STUB — not yet fully implemented. The declaration is registered so the LLM
// is aware of the capability, but the executor returns a "not available" error.
func calculateEMIDecl() *genai.FunctionDeclaration {
	return &genai.FunctionDeclaration{
		Name:        "calculate_emi",
		Description: "Calculate the Equated Monthly Instalment (EMI) for a given loan amount, interest rate, and term. Use this when the user wants to know the monthly payment for a specific rate, without performing an eligibility check.",
		Parameters: &genai.Schema{
			Type: genai.TypeObject,
			Properties: map[string]*genai.Schema{
				"amount": {
					Type:        genai.TypeNumber,
					Description: "Loan principal amount in ₹.",
				},
				"annual_rate": {
					Type:        genai.TypeNumber,
					Description: "Annual interest rate as a percentage (e.g., 8.5 for 8.5%).",
				},
				"term_months": {
					Type:        genai.TypeInteger,
					Description: "Repayment term in months.",
				},
			},
			Required: []string{"amount", "annual_rate", "term_months"},
		},
	}
}

// getLoanStatusDecl declares the schema for the get_loan_status tool.
// STUB — not yet fully implemented.
func getLoanStatusDecl() *genai.FunctionDeclaration {
	return &genai.FunctionDeclaration{
		Name:        "get_loan_status",
		Description: "Retrieve the current status of an existing loan application by its loan ID.",
		Parameters: &genai.Schema{
			Type: genai.TypeObject,
			Properties: map[string]*genai.Schema{
				"loan_id": {
					Type:        genai.TypeString,
					Description: "The numeric loan ID as a string (e.g., '42').",
				},
			},
			Required: []string{"loan_id"},
		},
	}
}

// getCustomerCreditScoreDecl declares the schema for the get_customer_credit_score tool.
// STUB — not yet fully implemented.
func getCustomerCreditScoreDecl() *genai.FunctionDeclaration {
	return &genai.FunctionDeclaration{
		Name:        "get_customer_credit_score",
		Description: "Retrieve the credit score for a customer by their customer ID.",
		Parameters: &genai.Schema{
			Type: genai.TypeObject,
			Properties: map[string]*genai.Schema{
				"customer_id": {
					Type:        genai.TypeString,
					Description: "The customer's unique identifier.",
				},
			},
			Required: []string{"customer_id"},
		},
	}
}

// createLoanApplicationDecl declares the schema for the create_loan_application tool.
func createLoanApplicationDecl() *genai.FunctionDeclaration {
	return &genai.FunctionDeclaration{
		Name:        "create_loan_application",
		Description: "Create a new loan application and persist it in the system. Use this tool when the context indicates a loan application is being submitted from a partner bank or the user explicitly asks to create an application.",
		Parameters: &genai.Schema{
			Type: genai.TypeObject,
			Properties: map[string]*genai.Schema{
				"amount": {
					Type:        genai.TypeNumber,
					Description: "The requested loan amount in Indian Rps (₹).",
				},
				"term_months": {
					Type:        genai.TypeInteger,
					Description: "Loan repayment term in months.",
				},
				"applicant_name": {
					Type:        genai.TypeString,
					Description: "The full name of the loan applicant.",
				},
				"email": {
					Type:        genai.TypeString,
					Description: "The email address of the loan applicant.",
				},
			},
			Required: []string{"amount", "term_months", "applicant_name", "email"},
		},
	}
}
