package main

import (
	"LOAN/internal/agent"
	"LOAN/internal/database"
	"LOAN/internal/handlers"
	"LOAN/internal/middleware"
	"LOAN/internal/repository"
	"LOAN/internal/service"
	"LOAN/internal/tools"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

func main() {
	// 1. Load local .env quietly. Inside Docker, variables are injected directly by the host system.
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found; assuming containerized environment variables are injected")
	}

	// ── Database ──────────────────────────────────────────────────────────
	db, err := database.NewDB()
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	if err := db.Migrate(); err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	// ── Repository → Service → Handlers (existing, untouched) ─────────────
	loanRepo := repository.NewLoanRepository(db.DB)
	loanService := service.NewLoanService(loanRepo)
	loanHandler := handlers.NewLoanHandler(loanService)
	assessmentRepo := repository.NewAssessmentRepository(db.DB)
	assessmentHandler := handlers.NewAssessmentHandler(service.NewAssessmentService(assessmentRepo))
	sdkHandler := handlers.NewSDKHandler(handlers.SDKSecretFromEnv())

	interviewSvc := service.NewInterviewService()
	interviewHandler := handlers.NewInterviewHandler(interviewSvc)

	// ── Mux ───────────────────────────────────────────────────────────────
	mux := http.NewServeMux()

	mux.HandleFunc("/api/v1/sdk/handshake", sdkHandler.Handshake)
	mux.HandleFunc("/api/v1/sdk/verify", sdkHandler.Verify)
	mux.HandleFunc("/api/v1/assessments", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			middleware.RequireAdmin(assessmentHandler.List)(w, r)
			return
		}
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	})
	mux.HandleFunc("/api/v1/assessments/", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			middleware.RequireAdmin(assessmentHandler.Get)(w, r)
		case http.MethodPut:
			middleware.RequireAdmin(assessmentHandler.Update)(w, r)
		case http.MethodDelete:
			middleware.RequireAdmin(assessmentHandler.Delete)(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})
	mux.HandleFunc("/api/v1/audit-logs", middleware.RequireAdmin(assessmentHandler.AuditLogs))
	mux.HandleFunc("/api/v1/loan-decisions/", middleware.RequireAdmin(assessmentHandler.Decide))

	// --- Interview Flow Endpoints ---
	mux.HandleFunc("/api/v1/interview/start", interviewHandler.Start)
	mux.HandleFunc("/api/v1/interview/state", interviewHandler.GetState)
	mux.HandleFunc("/api/v1/interview/answer", interviewHandler.Answer)
	mux.HandleFunc("/api/v1/interview/permission", interviewHandler.Permission)

	// Keep the agent API discoverable in every environment. When its optional
	// provider credentials are absent the route returns a clear 503 instead of
	// disappearing (and producing an ambiguous 404 for employee clients).
	agentChat := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusServiceUnavailable)
		w.Write([]byte(`{"error":"AI agent is not configured; set GEMINI_API_KEY to enable it."}`))
	})

	mux.HandleFunc("/api/loans", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			loanHandler.GetAllLoans(w, r)
		case http.MethodPost:
			loanHandler.CreateLoan(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	mux.HandleFunc("/api/loans/", func(w http.ResponseWriter, r *http.Request) {
		path := r.URL.Path
		if path == "/api/loans/" {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}

		switch r.Method {
		case http.MethodGet:
			loanHandler.GetLoan(w, r)
		case http.MethodPut:
			if strings.HasSuffix(path, "/status") {
				loanHandler.UpdateLoanStatus(w, r)
			} else {
				loanHandler.UpdateLoan(w, r)
			}
		case http.MethodDelete:
			loanHandler.DeleteLoan(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	// 2. FIXED: Explicit Liveness validation endpoint (`/healthz`) requested by your TL
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"alive"}`))
	})

	// Kept your original health endpoint for backward compatibility or readiness checks
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"healthy"}`))
	})

	mux.HandleFunc("/openapi.yaml", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "openapi.yaml")
	})
	mux.HandleFunc("/docs", handlers.SwaggerUI)

	// ── AI Agent (optional: skipped gracefully if GEMINI_API_KEY is absent) ──
	// Composition: tools → agent → handler → route
	// No Gemini logic, prompts, or tool definitions live here — they are in
	// internal/agent/ and internal/tools/.
	agentCfg, agentCfgErr := agent.AgentConfigFromEnv()
	if agentCfgErr != nil {
		log.Printf("AI Agent disabled: %v (set GEMINI_API_KEY to enable)", agentCfgErr)
	} else {
		// Register all tool executors. The agent whitelist enforces that only
		// functions in this map can ever be invoked by the LLM.
		toolRegistry := map[string]agent.ToolExecutor{
			"check_loan_eligibility":    tools.NewEligibilityTool(loanService),
			"calculate_emi":             tools.NewEMITool(),
			"get_loan_status":           tools.NewLoanStatusTool(),
			"get_customer_credit_score": tools.NewCustomerCreditTool(),
			"create_loan_application":   tools.NewCreateLoanTool(loanService),
		}

		loanAgent, err := agent.NewLoanAgent(agentCfg, toolRegistry)
		if err != nil {
			log.Printf("AI Agent failed to initialise: %v — agent endpoint will not be available", err)
		} else {
			agentHandler := handlers.NewAgentHandler(loanAgent)
			agentChat = agentHandler.Chat
			log.Printf("AI Agent enabled (model: %s)", agentCfg.Model)
		}
	}
	mux.HandleFunc("/api/v1/agent/chat", agentChat)

	// 3. Ensure the app dynamically reads the port assigned by Docker/Production systems
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" // Default fallback for running locally on your laptop
	}

	handler := middleware.CORS(mux)
	log.Printf("Server starting on port :%s", port)

	// 4. Bound correctly to dynamic port without hardcoded "localhost", ensuring Docker can route traffic
	log.Fatal(http.ListenAndServe(":"+port, handler))
}
