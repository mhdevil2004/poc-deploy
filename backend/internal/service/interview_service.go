package service

import (
	"errors"
	"fmt"
	"sync"
)

// --- Models ---

type InterviewSession struct {
	SessionID     string            `json:"session_id"`
	Partner       string            `json:"partner"`
	ApplicationID string            `json:"application_id"`
	CurrentStep   string            `json:"current_step"`
	Status        string            `json:"status"` // e.g., "active", "completed"
	Permissions   map[string]string `json:"permissions"`
	Answers       map[string]string `json:"answers"`
}

type UIGuide struct {
	Enabled bool   `json:"enabled"`
	Target  string `json:"target,omitempty"`
	Message string `json:"message,omitempty"`
}

type UIInstruction struct {
	Guide *UIGuide `json:"guide,omitempty"`
}

type QuestionOption struct {
	ID    string `json:"id"`
	Label string `json:"label"`
}

type QuestionDef struct {
	ID        string           `json:"id"`
	Text      string           `json:"text"`
	InputType string           `json:"input_type,omitempty"` // "choice", "text"
	Options   []QuestionOption `json:"options,omitempty"`
}

type ProgressInfo struct {
	Current int `json:"current"`
	Total   int `json:"total"`
}

type InterviewResponse struct {
	SessionID string         `json:"session_id"`
	Step      string         `json:"step"`
	Type      string         `json:"type"` // "message", "permission", "tips", "video_question"
	Message   string         `json:"message,omitempty"`
	Action    string         `json:"action,omitempty"` // "show_question", "request_camera_permission", "start_video", "record_video"
	Question  *QuestionDef   `json:"question,omitempty"`
	Tips      []string       `json:"tips,omitempty"`
	UI        *UIInstruction `json:"ui,omitempty"`
	Progress  ProgressInfo   `json:"progress"`
}

// --- Service Interface ---

type InterviewService interface {
	StartSession(partner string) (*InterviewResponse, error)
	GetSessionState(sessionID string) (*InterviewResponse, error)
	ProcessAnswer(sessionID, questionID, answer string) (*InterviewResponse, error)
	ProcessPermission(sessionID, permission, status string) (*InterviewResponse, error)
}

type interviewServiceImpl struct {
	mu       sync.RWMutex
	sessions map[string]*InterviewSession
	
	// Pre-defined sequence of steps
	sequence []string
}

func NewInterviewService() InterviewService {
	return &interviewServiceImpl{
		sessions: make(map[string]*InterviewSession),
		sequence: []string{
			"welcome",
			"permission_camera",
			"permission_microphone",
			"preparation",
			"video_ready",
			"introduction",
			"financial_details",
			"loan_details",
			"review",
			"completed",
		},
	}
}

func (s *interviewServiceImpl) getProgress(step string) ProgressInfo {
	total := len(s.sequence)
	current := 0
	for i, st := range s.sequence {
		if st == step {
			current = i + 1
			break
		}
	}
	return ProgressInfo{Current: current, Total: total}
}

func (s *interviewServiceImpl) buildResponse(session *InterviewSession) *InterviewResponse {
	resp := &InterviewResponse{
		SessionID: session.SessionID,
		Step:      session.CurrentStep,
		Progress:  s.getProgress(session.CurrentStep),
	}

	switch session.CurrentStep {
	case "welcome":
		resp.Type = "message"
		resp.Message = "Welcome! This short loan interview will take approximately 15 minutes."
		resp.Action = "show_question"
		resp.Question = &QuestionDef{
			ID:        "ready",
			Text:      "Do you have 15 minutes to complete this interview?",
			InputType: "choice",
			Options: []QuestionOption{
				{ID: "yes", Label: "Yes, let's start"},
				{ID: "no", Label: "Not now"},
			},
		}
	case "permission_camera":
		resp.Type = "permission"
		resp.Message = "Before we begin, we need access to your camera."
		resp.Action = "request_camera_permission"
		resp.UI = &UIInstruction{Guide: &UIGuide{Enabled: true, Target: "permission_btn", Message: "Please allow camera access to continue."}}
	case "permission_microphone":
		resp.Type = "permission"
		resp.Message = "We also need access to your microphone for the video interview."
		resp.Action = "request_microphone_permission"
	case "permission_location":
		resp.Type = "permission"
		resp.Message = "We need your location to verify the application context."
		resp.Action = "request_location_permission"
	case "preparation":
		resp.Type = "tips"
		resp.Message = "You're almost ready. Please take a moment to prepare."
		resp.Action = "show_preparation"
		resp.Tips = []string{
			"Make sure your face is clearly visible.",
			"Use good lighting.",
			"Make sure your internet connection is stable.",
			"Sit comfortably and keep your camera steady.",
			"Relax and answer naturally.",
			"Please answer honestly.",
			"Avoid moving away from the camera during the interview.",
		}
		resp.Question = &QuestionDef{
			ID: "prep_ready",
			Text: "Are you ready to begin?",
			InputType: "choice",
			Options: []QuestionOption{{ID: "yes", Label: "I'm ready"}},
		}
	case "video_ready":
		resp.Type = "video"
		resp.Message = "You're ready. Let's begin with a short introduction."
		resp.Action = "start_video"
		resp.Question = &QuestionDef{
			ID:        "video_ready",
			Text:      "Click Begin Interview when ready.",
			InputType: "action",
		}
		resp.UI = &UIInstruction{Guide: &UIGuide{Enabled: true, Target: "start_video_button", Message: "Click here when you're ready."}}
	case "introduction":
		resp.Type = "video_question"
		resp.Action = "record_video"
		resp.Question = &QuestionDef{
			ID:   "introduction",
			Text: "Please briefly introduce yourself and tell us why you are applying for this loan.",
			InputType: "text",
		}
	case "financial_details":
		resp.Type = "video_question"
		resp.Action = "record_video"
		resp.Question = &QuestionDef{
			ID:   "monthly_income",
			Text: "Can you tell us your approximate monthly income?",
			InputType: "text",
		}
	case "loan_details":
		resp.Type = "video_question"
		resp.Action = "record_video"
		resp.Question = &QuestionDef{
			ID:   "loan_purpose",
			Text: "What exactly do you plan to use this loan for?",
			InputType: "text",
		}
	case "review":
		resp.Type = "message"
		resp.Message = "Thank you for completing the video interview. Please review your answers before submitting."
		resp.Action = "show_question"
		resp.Question = &QuestionDef{
			ID: "submit_final",
			Text: "Submit application?",
			InputType: "choice",
			Options: []QuestionOption{{ID: "yes", Label: "Submit"}},
		}
	case "completed":
		resp.Type = "message"
		resp.Message = "Your interview has been completed and submitted successfully."
		resp.Action = "completed"
	}

	return resp
}

func (s *interviewServiceImpl) advanceSession(session *InterviewSession) {
	for i, step := range s.sequence {
		if step == session.CurrentStep && i < len(s.sequence)-1 {
			session.CurrentStep = s.sequence[i+1]
			break
		}
	}
}

func (s *interviewServiceImpl) StartSession(partner string) (*InterviewResponse, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	sessionID := fmt.Sprintf("sess_%s", generateID(8)) // Mock ID generation
	session := &InterviewSession{
		SessionID:   sessionID,
		Partner:     partner,
		CurrentStep: "welcome",
		Status:      "active",
		Permissions: make(map[string]string),
		Answers:     make(map[string]string),
	}
	s.sessions[sessionID] = session

	return s.buildResponse(session), nil
}

func (s *interviewServiceImpl) GetSessionState(sessionID string) (*InterviewResponse, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	session, ok := s.sessions[sessionID]
	if !ok {
		return nil, errors.New("session not found")
	}
	return s.buildResponse(session), nil
}

func (s *interviewServiceImpl) ProcessAnswer(sessionID, questionID, answer string) (*InterviewResponse, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	session, ok := s.sessions[sessionID]
	if !ok {
		return nil, errors.New("session not found")
	}

	if session.Status == "completed" {
		return nil, errors.New("interview already completed")
	}

	// Basic validation: user can't answer "yes" to ready and jump straight to completed.
	// The state machine strictly controls progression.
	session.Answers[questionID] = answer

	if questionID == "ready" && answer == "no" {
		// Stay on welcome but change message? Or just keep state. For simplicity, stay on welcome.
		resp := s.buildResponse(session)
		resp.Message = "No problem. You can return to this interview when you have 15 minutes."
		return resp, nil
	}

	// Advance to next step
	s.advanceSession(session)
	
	if session.CurrentStep == "completed" {
		session.Status = "completed"
	}

	return s.buildResponse(session), nil
}

func (s *interviewServiceImpl) ProcessPermission(sessionID, permission, status string) (*InterviewResponse, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	session, ok := s.sessions[sessionID]
	if !ok {
		return nil, errors.New("session not found")
	}

	// Record permission
	session.Permissions[permission] = status

	// Regardless of granted/denied, we advance to the next step for this POC.
	// In reality, we might branch if a required permission is denied.
	s.advanceSession(session)

	return s.buildResponse(session), nil
}

// Simple helper to generate random string
func generateID(n int) string {
	return "abc12345" // hardcoded for POC simplicity, ideally crypto/rand
}
