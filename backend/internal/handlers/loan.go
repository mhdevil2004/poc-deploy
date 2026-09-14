package handlers

import (
	"LOAN/internal/models"
	"LOAN/internal/service"
	"encoding/json"
	"net/http"
	"strings"
)

type LoanHandler struct {
	service *service.LoanService
}

func NewLoanHandler(service *service.LoanService) *LoanHandler {
	return &LoanHandler{service: service}
}

// CreateLoan handles POST /api/loans
func (h *LoanHandler) CreateLoan(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		h.sendError(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req models.LoanRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.sendError(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate request
	if err := h.validateRequest(req); err != nil {
		h.sendError(w, err.Error(), http.StatusBadRequest)
		return
	}

	loan, err := h.service.CreateLoan(req)
	if err != nil {
		h.sendError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	h.sendSuccess(w, "Loan created successfully", loan, http.StatusCreated)
}

// GetAllLoans handles GET /api/loans
func (h *LoanHandler) GetAllLoans(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		h.sendError(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	loans, err := h.service.GetAllLoans()
	if err != nil {
		h.sendError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	h.sendSuccess(w, "Loans retrieved successfully", loans, http.StatusOK)
}

// GetLoan handles GET /api/loans/{id}
func (h *LoanHandler) GetLoan(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		h.sendError(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	id := strings.TrimPrefix(r.URL.Path, "/api/loans/")
	if id == "" {
		h.sendError(w, "Loan ID is required", http.StatusBadRequest)
		return
	}

	loan, err := h.service.GetLoanByID(id)
	if err != nil {
		h.sendError(w, "Loan not found", http.StatusNotFound)
		return
	}

	h.sendSuccess(w, "Loan retrieved successfully", loan, http.StatusOK)
}

// UpdateLoan handles PUT /api/loans/{id}
func (h *LoanHandler) UpdateLoan(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		h.sendError(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	id := strings.TrimPrefix(r.URL.Path, "/api/loans/")
	if id == "" || strings.Contains(id, "/") {
		h.sendError(w, "Invalid loan ID", http.StatusBadRequest)
		return
	}

	var req models.UpdateLoanDetailsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.sendError(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.validateUpdateRequest(req); err != nil {
		h.sendError(w, err.Error(), http.StatusBadRequest)
		return
	}

	loan, err := h.service.UpdateLoan(id, req)
	if err != nil {
		h.sendError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	h.sendSuccess(w, "Loan updated successfully", loan, http.StatusOK)
}

// UpdateLoanStatus handles PUT /api/loans/{id}/status
func (h *LoanHandler) UpdateLoanStatus(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		h.sendError(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	id := strings.TrimPrefix(r.URL.Path, "/api/loans/")
	id = strings.TrimSuffix(id, "/status")
	if id == "" {
		h.sendError(w, "Loan ID is required", http.StatusBadRequest)
		return
	}

	var req models.UpdateLoanRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.sendError(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	var loan *models.Loan
	var err error

	switch req.Status {
	case "approve":
		loan, err = h.service.ApproveLoan(id)
	case "reject":
		loan, err = h.service.RejectLoan(id)
	default:
		h.sendError(w, "Invalid status. Use 'approve' or 'reject'", http.StatusBadRequest)
		return
	}

	if err != nil {
		h.sendError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	h.sendSuccess(w, "Loan updated successfully", loan, http.StatusOK)
}

// DeleteLoan handles DELETE /api/loans/{id}
func (h *LoanHandler) DeleteLoan(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		h.sendError(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	id := strings.TrimPrefix(r.URL.Path, "/api/loans/")
	if id == "" {
		h.sendError(w, "Loan ID is required", http.StatusBadRequest)
		return
	}

	if err := h.service.DeleteLoan(id); err != nil {
		h.sendError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	h.sendSuccess(w, "Loan deleted successfully", nil, http.StatusOK)
}

// Helper methods
func (h *LoanHandler) validateRequest(req models.LoanRequest) error {
	if req.ApplicantName == "" {
		return &ValidationError{Field: "applicant_name", Message: "is required"}
	}
	if req.Email == "" {
		return &ValidationError{Field: "email", Message: "is required"}
	}
	if req.Amount <= 0 {
		return &ValidationError{Field: "amount", Message: "must be greater than 0"}
	}
	if req.TermMonths <= 0 {
		return &ValidationError{Field: "term_months", Message: "must be greater than 0"}
	}
	return nil
}

func (h *LoanHandler) sendSuccess(w http.ResponseWriter, message string, data interface{}, status int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(models.LoanResponse{
		Success: true,
		Message: message,
		Data:    data,
	})
}

func (h *LoanHandler) sendError(w http.ResponseWriter, message string, status int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(models.LoanResponse{
		Success: false,
		Message: message,
		Errors:  []string{message},
	})
}

type ValidationError struct {
	Field   string
	Message string
}

func (e *ValidationError) Error() string {
	return e.Field + " " + e.Message
}

func (h *LoanHandler) validateUpdateRequest(req models.UpdateLoanDetailsRequest) error {
	if req.ApplicantName == "" {
		return &ValidationError{Field: "applicant_name", Message: "is required"}
	}
	if req.Email == "" {
		return &ValidationError{Field: "email", Message: "is required"}
	}
	if req.Amount <= 0 {
		return &ValidationError{Field: "amount", Message: "must be greater than 0"}
	}
	if req.TermMonths <= 0 {
		return &ValidationError{Field: "term_months", Message: "must be greater than 0"}
	}
	return nil
}
