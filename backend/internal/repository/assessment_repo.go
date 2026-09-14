package repository

import (
	"LOAN/internal/models"
	"database/sql"
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
	"time"
)

type AssessmentRepository struct{ db *sql.DB }

func NewAssessmentRepository(db *sql.DB) *AssessmentRepository { return &AssessmentRepository{db: db} }

const assessmentSelect = `SELECT a.id,a.loan_id,a.loan_reference,l.applicant_name,l.email,a.business_name,a.business_type,a.location,l.amount,a.status,a.score_band,a.notes,a.assigned_analyst,a.created_at,a.updated_at FROM assessments a JOIN loans l ON l.id=a.loan_id WHERE a.deleted_at IS NULL`

func scanAssessment(s interface{ Scan(...any) error }) (*models.Assessment, error) {
	var a models.Assessment
	var id, lid int64
	err := s.Scan(&id, &lid, &a.LoanReference, &a.Borrower, &a.Email, &a.BusinessName, &a.BusinessType, &a.Location, &a.RequestedAmount, &a.Status, &a.ScoreBand, &a.Notes, &a.AssignedAnalyst, &a.CreatedAt, &a.UpdatedAt)
	if err != nil {
		return nil, err
	}
	a.ID = strconv.FormatInt(id, 10)
	a.LoanID = strconv.FormatInt(lid, 10)
	return &a, nil
}
func (r *AssessmentRepository) List(f models.AssessmentFilters) ([]models.Assessment, error) {
	q := assessmentSelect
	args := []any{}
	add := func(c string, v any) { args = append(args, v); q += fmt.Sprintf(" AND %s = $%d", c, len(args)) }
	if f.LoanReference != "" {
		args = append(args, "%"+f.LoanReference+"%")
		q += fmt.Sprintf(" AND a.loan_reference ILIKE $%d", len(args))
	}
	if f.Status != "" {
		add("a.status", f.Status)
	}
	if f.ScoreBand != "" {
		add("a.score_band", f.ScoreBand)
	}
	if f.StartDate != nil {
		args = append(args, *f.StartDate)
		q += fmt.Sprintf(" AND a.created_at >= $%d", len(args))
	}
	if f.EndDate != nil {
		args = append(args, *f.EndDate)
		q += fmt.Sprintf(" AND a.created_at < $%d", len(args))
	}
	q += " ORDER BY a.created_at DESC"
	rows, err := r.db.Query(q, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []models.Assessment{}
	for rows.Next() {
		a, e := scanAssessment(rows)
		if e != nil {
			return nil, e
		}
		out = append(out, *a)
	}
	return out, rows.Err()
}
func (r *AssessmentRepository) Get(id string) (*models.Assessment, error) {
	return scanAssessment(r.db.QueryRow(assessmentSelect+" AND a.id=$1", id))
}
func (r *AssessmentRepository) Update(id string, req models.UpdateAssessmentRequest) (*models.Assessment, error) {
	_, err := r.db.Exec(`UPDATE assessments SET status=$1,score_band=$2,notes=$3,assigned_analyst=$4,updated_at=CURRENT_TIMESTAMP WHERE id=$5 AND deleted_at IS NULL`, req.Status, req.ScoreBand, req.Notes, req.AssignedAnalyst, id)
	if err != nil {
		return nil, err
	}
	return r.Get(id)
}

// UpdateWithAudit commits the assessment change and its audit entry together.
// A successful edit can therefore never be missing its audit record.
func (r *AssessmentRepository) UpdateWithAudit(id string, req models.UpdateAssessmentRequest, userID, userName, role string, previous *models.Assessment) (*models.Assessment, error) {
	tx, err := r.db.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	result, err := tx.Exec(`UPDATE assessments SET status=$1,score_band=$2,notes=$3,assigned_analyst=$4,updated_at=CURRENT_TIMESTAMP WHERE id=$5 AND deleted_at IS NULL`, req.Status, req.ScoreBand, req.Notes, req.AssignedAnalyst, id)
	if err != nil {
		return nil, err
	}
	if rows, _ := result.RowsAffected(); rows == 0 {
		return nil, sql.ErrNoRows
	}
	updated, err := scanAssessment(tx.QueryRow(assessmentSelect+" AND a.id=$1", id))
	if err != nil {
		return nil, err
	}
	if err = addAudit(tx, userID, userName, role, "UPDATED_ASSESSMENT", updated, previous, updated); err != nil {
		return nil, err
	}
	if err = tx.Commit(); err != nil {
		return nil, err
	}
	return updated, nil
}
func (r *AssessmentRepository) SoftDelete(id string) error {
	result, err := r.db.Exec(`UPDATE assessments SET deleted_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=$1 AND deleted_at IS NULL`, id)
	if err != nil {
		return err
	}
	n, _ := result.RowsAffected()
	if n == 0 {
		return sql.ErrNoRows
	}
	return nil
}

// SoftDeleteWithAudit makes a delete event durable only when the soft-delete
// itself succeeds.
func (r *AssessmentRepository) SoftDeleteWithAudit(id, userID, userName, role string, assessment *models.Assessment) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()
	result, err := tx.Exec(`UPDATE assessments SET deleted_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=$1 AND deleted_at IS NULL`, id)
	if err != nil {
		return err
	}
	if rows, _ := result.RowsAffected(); rows == 0 {
		return sql.ErrNoRows
	}
	if err = addAudit(tx, userID, userName, role, "DELETED_ASSESSMENT", assessment, assessment, nil); err != nil {
		return err
	}
	return tx.Commit()
}

type auditExecutor interface {
	Exec(query string, args ...any) (sql.Result, error)
}

func (r *AssessmentRepository) AddAudit(userID, userName, role, action string, a *models.Assessment, previous, newValue any) error {
	return addAudit(r.db, userID, userName, role, action, a, previous, newValue)
}
func addAudit(db auditExecutor, userID, userName, role, action string, a *models.Assessment, previous, newValue any) error {
	p, e := json.Marshal(previous)
	if e != nil {
		return e
	}
	n, e := json.Marshal(newValue)
	if e != nil {
		return e
	}
	_, e = db.Exec(`INSERT INTO audit_logs(user_id,user_name,role,action,resource,resource_id,loan_reference,previous_value,new_value) VALUES($1,$2,$3,$4,'assessment',$5,$6,$7,$8)`, userID, userName, role, action, a.ID, a.LoanReference, p, n)
	return e
}
func (r *AssessmentRepository) AuditLogs() ([]models.AuditLog, error) {
	rows, e := r.db.Query(`SELECT id,user_id,user_name,role,action,resource,resource_id,COALESCE(loan_reference,''),previous_value,new_value,created_at FROM audit_logs ORDER BY created_at DESC`)
	if e != nil {
		return nil, e
	}
	defer rows.Close()
	out := []models.AuditLog{}
	for rows.Next() {
		var x models.AuditLog
		var id, rid int64
		var p, n []byte
		if e := rows.Scan(&id, &x.UserID, &x.UserName, &x.Role, &x.Action, &x.Resource, &rid, &x.LoanReference, &p, &n, &x.CreatedAt); e != nil {
			return nil, e
		}
		x.ID = strconv.FormatInt(id, 10)
		x.ResourceID = strconv.FormatInt(rid, 10)
		if len(p) > 0 {
			_ = json.Unmarshal(p, &x.PreviousValue)
		}
		if len(n) > 0 {
			_ = json.Unmarshal(n, &x.NewValue)
		}
		out = append(out, x)
	}
	return out, rows.Err()
}

// ExecuteDecision persists the workflow record, the visible loan/assessment
// state, and the audit trail in one transaction.
func (r *AssessmentRepository) ExecuteDecision(actorID, actorName, role, loanReference string, req models.LoanDecisionRequest) (*models.LoanDecision, error) {
	tx, err := r.db.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	a, err := scanAssessment(tx.QueryRow(assessmentSelect+" AND a.loan_reference=$1", loanReference))
	if err != nil {
		return nil, err
	}
	var oldLoanStatus string
	if err = tx.QueryRow("SELECT status FROM loans WHERE id=$1", a.LoanID).Scan(&oldLoanStatus); err != nil {
		return nil, err
	}
	previous := map[string]any{"loan_status": "", "assessment_status": a.Status, "score_band": a.ScoreBand, "amount": a.RequestedAmount}
	var loanStatus, assessmentStatus, band string
	switch req.Action {
	case "APPROVE_DISBURSE", "ADMIN_FORCE_APPROVE":
		loanStatus, assessmentStatus, band = "approved", models.StatusComplete, a.ScoreBand
	case "REJECT_APPLICATION":
		loanStatus, assessmentStatus, band = "rejected", models.StatusFlagged, "CONTRADICTED"
	case "ADJUST_TERMS":
		loanStatus, assessmentStatus, band = "pending", models.StatusPending, a.ScoreBand
	case "FLAG_RISK_REVIEW", "TRIGGER_FRAUD_SCAN":
		loanStatus, assessmentStatus, band = "pending", models.StatusFlagged, "CONTRADICTED"
	case "APPROVE_RISK_EXCEPTION":
		loanStatus, assessmentStatus, band = "pending", models.StatusComplete, a.ScoreBand
	case "REASSIGN_OFFICER", "OVERRIDE_RULE_PARAMETERS":
		loanStatus, assessmentStatus, band = oldLoanStatus, a.Status, a.ScoreBand
	default:
		return nil, fmt.Errorf("invalid decision action")
	}
	previous["loan_status"] = oldLoanStatus
	if req.Action == "ADJUST_TERMS" {
		if req.Amount == nil || *req.Amount <= 0 || req.TermMonths == nil || *req.TermMonths <= 0 {
			return nil, fmt.Errorf("amount and term_months must be positive for an adjustment")
		}
		_, err = tx.Exec("UPDATE loans SET amount=$1,term_months=$2,monthly_payment=$1/$2,total_payment=($1/$2)*$2*(1+interest_rate/100),status=$3,updated_at=CURRENT_TIMESTAMP WHERE id=$4", *req.Amount, *req.TermMonths, loanStatus, a.LoanID)
	} else {
		_, err = tx.Exec("UPDATE loans SET status=$1,updated_at=CURRENT_TIMESTAMP WHERE id=$2", loanStatus, a.LoanID)
	}
	if err != nil {
		return nil, err
	}
	notes := a.Notes
	if req.Notes != "" {
		notes = strings.TrimSpace(notes + "\n" + req.Notes)
	}
	assigned := a.AssignedAnalyst
	if req.Action == "REASSIGN_OFFICER" && req.AssignedAnalyst != "" {
		assigned = req.AssignedAnalyst
	}
	_, err = tx.Exec("UPDATE assessments SET status=$1,score_band=$2,notes=$3,assigned_analyst=$4,updated_at=CURRENT_TIMESTAMP WHERE id=$5", assessmentStatus, band, notes, assigned, a.ID)
	if err != nil {
		return nil, err
	}
	details, err := json.Marshal(req)
	if err != nil {
		return nil, err
	}
	var id int64
	err = tx.QueryRow("INSERT INTO loan_decisions(assessment_id,action,status,performed_by,performed_role,details) VALUES($1,$2,$3,$4,$5,$6) RETURNING id", a.ID, req.Action, loanStatus, actorID, role, details).Scan(&id)
	if err != nil {
		return nil, err
	}
	updated, err := scanAssessment(tx.QueryRow(assessmentSelect+" AND a.id=$1", a.ID))
	if err != nil {
		return nil, err
	}
	if err = addAudit(tx, actorID, actorName, role, req.Action, updated, previous, map[string]any{"loan_status": loanStatus, "assessment_status": assessmentStatus, "amount": req.Amount, "term_months": req.TermMonths, "assigned_analyst": assigned}); err != nil {
		return nil, err
	}
	if err = tx.Commit(); err != nil {
		return nil, err
	}
	return &models.LoanDecision{ID: strconv.FormatInt(id, 10), LoanReference: loanReference, Action: req.Action, Status: loanStatus, PerformedBy: actorName, PerformedRole: role, CreatedAt: time.Now().UTC()}, nil
}
func ParseDate(s string, end bool) (*time.Time, error) {
	if s == "" {
		return nil, nil
	}
	t, e := time.Parse("2006-01-02", s)
	if e != nil {
		return nil, e
	}
	if end {
		t = t.AddDate(0, 0, 1)
	}
	return &t, nil
}
func clean(s string) string { return strings.TrimSpace(s) }
