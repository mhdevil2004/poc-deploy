package main

import (
	"context"
	"fmt"
	"log"

	"LOAN/internal/agent"
	"LOAN/internal/repository"
	"LOAN/internal/service"
	"LOAN/internal/tools"
	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load(".env")
	cfg, err := agent.AgentConfigFromEnv()
	if err != nil {
		log.Fatal(err)
	}

	loanService := service.NewLoanService(repository.NewLoanRepository(nil))
	toolRegistry := map[string]agent.ToolExecutor{
		"check_loan_eligibility":    tools.NewEligibilityTool(loanService),
		"calculate_emi":             tools.NewEMITool(),
		"get_loan_status":           tools.NewLoanStatusTool(),
		"get_customer_credit_score": tools.NewCustomerCreditTool(),
	}

	loanAgent, err := agent.NewLoanAgent(cfg, toolRegistry)
	if err != nil {
		log.Fatal(err)
	}

	resp, err := loanAgent.Chat(context.Background(), agent.ChatRequest{Message: "Can I get a loan of 500000?"})
	if err != nil {
		log.Fatalf("Chat error: %v", err)
	}
	fmt.Printf("Response: %+v\n", resp)
}
