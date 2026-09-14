package handlers

import (
	"LOAN/internal/middleware"
	"LOAN/internal/models"
	"LOAN/internal/repository"
	"LOAN/internal/service"
	"encoding/json"
	"errors"
	"net/http"
	"strings"
)

type AssessmentHandler struct{ service *service.AssessmentService }

func NewAssessmentHandler(s *service.AssessmentService) *AssessmentHandler {
	return &AssessmentHandler{s}
}
func adminActor(r *http.Request) service.Actor {
	i, _ := middleware.AdminIdentityFromRequest(r)
	return service.Actor{ID: i.ID, Name: i.Name, Role: i.Role}
}
func jsonError(w http.ResponseWriter, status int, code, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(map[string]any{"error": map[string]string{"code": code, "message": message}})
}
func jsonData(w http.ResponseWriter, data any) {
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{"data": data})
}
func (h *AssessmentHandler) List(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	status, band := q.Get("status"), q.Get("score_band")
	if status != "" && !models.ValidAssessmentStatus(status) {
		jsonError(w, 400, "INVALID_STATUS", "Status must be pending, complete, or flagged")
		return
	}
	if band != "" && !models.AssessmentBands[band] {
		jsonError(w, 400, "INVALID_SCORE_BAND", "Invalid Fintilla assessment band")
		return
	}
	start, e := repository.ParseDate(q.Get("start_date"), false)
	if e != nil {
		jsonError(w, 400, "INVALID_DATE", "start_date must be YYYY-MM-DD")
		return
	}
	end, e := repository.ParseDate(q.Get("end_date"), true)
	if e != nil {
		jsonError(w, 400, "INVALID_DATE", "end_date must be YYYY-MM-DD")
		return
	}
	items, e := h.service.List(models.AssessmentFilters{LoanReference: q.Get("loan_reference"), Status: status, ScoreBand: band, StartDate: start, EndDate: end})
	if e != nil {
		jsonError(w, 500, "INTERNAL_ERROR", "Unable to load assessments")
		return
	}
	jsonData(w, items)
}
func (h *AssessmentHandler) Get(w http.ResponseWriter, r *http.Request) {
	a, e := h.service.Get(strings.TrimPrefix(r.URL.Path, "/api/v1/assessments/"))
	if errors.Is(e, service.ErrNotFound) {
		jsonError(w, 404, "ASSESSMENT_NOT_FOUND", "Assessment not found")
		return
	}
	if e != nil {
		jsonError(w, 500, "INTERNAL_ERROR", "Unable to load assessment")
		return
	}
	jsonData(w, a)
}
func (h *AssessmentHandler) Update(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/api/v1/assessments/")
	var req models.UpdateAssessmentRequest
	if e := json.NewDecoder(r.Body).Decode(&req); e != nil {
		jsonError(w, 400, "INVALID_REQUEST", "Invalid request body")
		return
	}
	a, e := h.service.Update(adminActor(r), id, req)
	if e != nil {
		h.mutationError(w, e)
		return
	}
	jsonData(w, a)
}
func (h *AssessmentHandler) Delete(w http.ResponseWriter, r *http.Request) {
	e := h.service.Delete(adminActor(r), strings.TrimPrefix(r.URL.Path, "/api/v1/assessments/"))
	if e != nil {
		h.mutationError(w, e)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
func (h *AssessmentHandler) AuditLogs(w http.ResponseWriter, r *http.Request) {
	a, e := h.service.AuditLogs()
	if e != nil {
		jsonError(w, 500, "INTERNAL_ERROR", "Unable to load audit logs")
		return
	}
	jsonData(w, a)
}
func (h *AssessmentHandler) Decide(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		jsonError(w, http.StatusMethodNotAllowed, "METHOD_NOT_ALLOWED", "Use POST to submit a loan decision")
		return
	}
	loanReference := strings.TrimPrefix(r.URL.Path, "/api/v1/loan-decisions/")
	if loanReference == "" || strings.Contains(loanReference, "/") {
		jsonError(w, 400, "INVALID_LOAN_REFERENCE", "A loan reference is required")
		return
	}
	var req models.LoanDecisionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, 400, "INVALID_REQUEST", "Invalid request body")
		return
	}
	d, err := h.service.Decide(adminActor(r), loanReference, req)
	if err != nil {
		h.mutationError(w, err)
		return
	}
	jsonData(w, d)
}
func (h *AssessmentHandler) mutationError(w http.ResponseWriter, e error) {
	if errors.Is(e, service.ErrNotFound) {
		jsonError(w, 404, "ASSESSMENT_NOT_FOUND", "Assessment not found")
	} else if e.Error() == "forbidden" {
		jsonError(w, 403, "FORBIDDEN", "Your role cannot perform this action")
	} else if strings.Contains(e.Error(), "invalid assessment") {
		jsonError(w, 400, "INVALID_ASSESSMENT", "Invalid assessment status or score band")
	} else {
		jsonError(w, 500, "INTERNAL_ERROR", "Unable to save assessment")
	}
}
