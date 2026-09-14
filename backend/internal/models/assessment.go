package models

import "time"

const (
	StatusPending  = "pending"
	StatusComplete = "complete"
	StatusFlagged  = "flagged"
)

var AssessmentBands = map[string]bool{
	"VERIFIED-STRONG": true, "VERIFIED-ADEQUATE": true, "VERIFIED-THIN": true,
	"UNVERIFIED": true, "CONTRADICTED": true,
}

type Assessment struct {
	ID              string    `json:"id"`
	LoanID          string    `json:"loan_id"`
	LoanReference   string    `json:"loan_reference"`
	Borrower        string    `json:"borrower"`
	Email           string    `json:"email"`
	BusinessName    string    `json:"business_name"`
	BusinessType    string    `json:"business_type"`
	Location        string    `json:"location"`
	RequestedAmount float64   `json:"requested_amount"`
	Status          string    `json:"status"`
	ScoreBand       string    `json:"score_band"`
	Notes           string    `json:"notes"`
	AssignedAnalyst string    `json:"assigned_analyst"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}
type AssessmentFilters struct {
	LoanReference, Status, ScoreBand string
	StartDate, EndDate               *time.Time
}
type UpdateAssessmentRequest struct {
	Status          string `json:"status"`
	ScoreBand       string `json:"score_band"`
	Notes           string `json:"notes"`
	AssignedAnalyst string `json:"assigned_analyst"`
}
type AuditLog struct {
	ID            string    `json:"id"`
	UserID        string    `json:"user_id"`
	UserName      string    `json:"user_name"`
	Role          string    `json:"role"`
	Action        string    `json:"action"`
	Resource      string    `json:"resource"`
	ResourceID    string    `json:"resource_id"`
	LoanReference string    `json:"loan_reference"`
	PreviousValue any       `json:"previous_value,omitempty"`
	NewValue      any       `json:"new_value,omitempty"`
	CreatedAt     time.Time `json:"created_at"`
}

// LoanDecisionRequest is deliberately action based: the API never accepts a
// client-supplied status transition without first checking the actor's role.
type LoanDecisionRequest struct {
	Action          string   `json:"action"`
	Amount          *float64 `json:"amount,omitempty"`
	TermMonths      *int     `json:"term_months,omitempty"`
	AssignedAnalyst string   `json:"assigned_analyst,omitempty"`
	Notes           string   `json:"notes,omitempty"`
}

type LoanDecision struct {
	ID, LoanReference, Action, Status, PerformedBy, PerformedRole string
	CreatedAt                                                     time.Time `json:"created_at"`
}

func ValidAssessmentStatus(v string) bool {
	return v == StatusPending || v == StatusComplete || v == StatusFlagged
}
