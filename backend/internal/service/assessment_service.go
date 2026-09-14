package service

import (
	"LOAN/internal/models"
	"LOAN/internal/repository"
	"database/sql"
	"errors"
)

var ErrNotFound = errors.New("not found")

const (
	RoleAdministrator   = "Administrator"
	RoleRiskOfficer     = "Risk Officer"
	RoleUnderwriter     = "Underwriter"
	RoleReadOnlyAuditor = "Read-Only Auditor"
)

type Actor struct{ ID, Name, Role string }
type AssessmentService struct {
	repo *repository.AssessmentRepository
}

func NewAssessmentService(r *repository.AssessmentRepository) *AssessmentService {
	return &AssessmentService{r}
}
func (s *AssessmentService) List(f models.AssessmentFilters) ([]models.Assessment, error) {
	return s.repo.List(f)
}
func (s *AssessmentService) Get(id string) (*models.Assessment, error) {
	a, e := s.repo.Get(id)
	if errors.Is(e, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	return a, e
}
func (s *AssessmentService) Update(actor Actor, id string, req models.UpdateAssessmentRequest) (*models.Assessment, error) {
	// Keep this allow-list on the server. UI checks are only a convenience and
	// must never be relied upon to protect persisted assessment data.
	if actor.Role != RoleAdministrator && actor.Role != RoleRiskOfficer && actor.Role != RoleUnderwriter {
		return nil, errors.New("forbidden")
	}
	if !models.ValidAssessmentStatus(req.Status) || !models.AssessmentBands[req.ScoreBand] {
		return nil, errors.New("invalid assessment status or score band")
	}
	old, e := s.Get(id)
	if e != nil {
		return nil, e
	}
	updated, e := s.repo.UpdateWithAudit(id, req, actor.ID, actor.Name, actor.Role, old)
	if errors.Is(e, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	return updated, e
}
func (s *AssessmentService) Delete(actor Actor, id string) error {
	if actor.Role != RoleAdministrator {
		return errors.New("forbidden")
	}
	a, e := s.Get(id)
	if e != nil {
		return e
	}
	e = s.repo.SoftDeleteWithAudit(id, actor.ID, actor.Name, actor.Role, a)
	if errors.Is(e, sql.ErrNoRows) {
		return ErrNotFound
	}
	return e
}
func (s *AssessmentService) AuditLogs() ([]models.AuditLog, error) { return s.repo.AuditLogs() }

func (s *AssessmentService) Decide(actor Actor, loanReference string, req models.LoanDecisionRequest) (*models.LoanDecision, error) {
	allowed := map[string]map[string]bool{
		RoleUnderwriter:   {"APPROVE_DISBURSE": true, "ADJUST_TERMS": true, "REJECT_APPLICATION": true},
		RoleRiskOfficer:   {"FLAG_RISK_REVIEW": true, "APPROVE_RISK_EXCEPTION": true, "TRIGGER_FRAUD_SCAN": true},
		RoleAdministrator: {"ADMIN_FORCE_APPROVE": true, "REASSIGN_OFFICER": true, "OVERRIDE_RULE_PARAMETERS": true},
	}
	if !allowed[actor.Role][req.Action] {
		return nil, errors.New("forbidden")
	}
	d, err := s.repo.ExecuteDecision(actor.ID, actor.Name, actor.Role, loanReference, req)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	return d, err
}
