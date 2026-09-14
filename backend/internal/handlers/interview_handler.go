package handlers

import (
	"encoding/json"
	"net/http"

	"LOAN/internal/service"
)

type InterviewHandler struct {
	svc service.InterviewService
}

func NewInterviewHandler(svc service.InterviewService) *InterviewHandler {
	return &InterviewHandler{svc: svc}
}

// GET /api/v1/interview/start?partner=SBI
func (h *InterviewHandler) Start(w http.ResponseWriter, r *http.Request) {
	partner := r.URL.Query().Get("partner")
	if partner == "" {
		partner = "UNKNOWN"
	}

	resp, err := h.svc.StartSession(partner)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

// GET /api/v1/interview/state?session_id=abc
func (h *InterviewHandler) GetState(w http.ResponseWriter, r *http.Request) {
	sessionID := r.URL.Query().Get("session_id")
	if sessionID == "" {
		http.Error(w, "missing session_id", http.StatusBadRequest)
		return
	}

	resp, err := h.svc.GetSessionState(sessionID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

type AnswerRequest struct {
	SessionID  string `json:"session_id"`
	QuestionID string `json:"question_id"`
	Answer     string `json:"answer"`
}

// POST /api/v1/interview/answer
func (h *InterviewHandler) Answer(w http.ResponseWriter, r *http.Request) {
	var req AnswerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	resp, err := h.svc.ProcessAnswer(req.SessionID, req.QuestionID, req.Answer)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

type PermissionRequest struct {
	SessionID  string `json:"session_id"`
	Permission string `json:"permission"`
	Status     string `json:"status"` // granted or denied
}

// POST /api/v1/interview/permission
func (h *InterviewHandler) Permission(w http.ResponseWriter, r *http.Request) {
	var req PermissionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	resp, err := h.svc.ProcessPermission(req.SessionID, req.Permission, req.Status)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
