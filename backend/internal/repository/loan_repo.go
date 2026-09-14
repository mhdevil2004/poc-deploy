package repository

import (
	"database/sql"
	"strconv"
	"time"

	"LOAN/internal/models"
)

func scanID(id int64) string {
	return strconv.FormatInt(id, 10)
}

type LoanRepository struct {
	db *sql.DB
}

func NewLoanRepository(db *sql.DB) *LoanRepository {
	return &LoanRepository{db: db}
}

// Create inserts a new loan into database
func (r *LoanRepository) Create(loan *models.Loan) error {
	query := `
    INSERT INTO loans (
        applicant_name, email, amount, term_months, 
        interest_rate, monthly_payment, total_payment, 
        status, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING id
    `
	var id int64
	err := r.db.QueryRow(
		query,
		loan.ApplicantName,
		loan.Email,
		loan.Amount,
		loan.TermMonths,
		loan.InterestRate,
		loan.MonthlyPayment,
		loan.TotalPayment,
		loan.Status,
		loan.CreatedAt,
		loan.UpdatedAt,
	).Scan(&id)
	if err != nil {
		return err
	}
	loan.ID = scanID(id)
	return nil
}

// GetAll retrieves all loans
func (r *LoanRepository) GetAll() ([]models.Loan, error) {
	query := `
    SELECT id, applicant_name, email, amount, term_months,
           interest_rate, monthly_payment, total_payment,
           status, created_at, updated_at
    FROM loans ORDER BY id DESC
    `
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	loans := make([]models.Loan, 0)
	for rows.Next() {
		var l models.Loan
		var id int64
		err := rows.Scan(
			&id,
			&l.ApplicantName,
			&l.Email,
			&l.Amount,
			&l.TermMonths,
			&l.InterestRate,
			&l.MonthlyPayment,
			&l.TotalPayment,
			&l.Status,
			&l.CreatedAt,
			&l.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		l.ID = scanID(id)
		loans = append(loans, l)
	}
	return loans, nil
}

// GetByID retrieves a loan by ID
func (r *LoanRepository) GetByID(id string) (*models.Loan, error) {
	query := `
    SELECT id, applicant_name, email, amount, term_months,
           interest_rate, monthly_payment, total_payment,
           status, created_at, updated_at
    FROM loans WHERE id = $1
    `
	var l models.Loan
	var numericID int64
	err := r.db.QueryRow(query, id).Scan(
		&numericID,
		&l.ApplicantName,
		&l.Email,
		&l.Amount,
		&l.TermMonths,
		&l.InterestRate,
		&l.MonthlyPayment,
		&l.TotalPayment,
		&l.Status,
		&l.CreatedAt,
		&l.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	l.ID = scanID(numericID)
	return &l, nil
}

// UpdateStatus updates loan status
func (r *LoanRepository) UpdateStatus(id string, status string) error {
	query := `UPDATE loans SET status = $1, updated_at = $2 WHERE id = $3`
	_, err := r.db.Exec(query, status, time.Now(), id)
	return err
}

// Update changes editable loan fields.
func (r *LoanRepository) Update(loan *models.Loan) error {
	query := `
	UPDATE loans
	SET applicant_name = $1,
		email = $2,
		amount = $3,
		term_months = $4,
		interest_rate = $5,
		monthly_payment = $6,
		total_payment = $7,
		updated_at = $8
	WHERE id = $9
	`
	_, err := r.db.Exec(
		query,
		loan.ApplicantName,
		loan.Email,
		loan.Amount,
		loan.TermMonths,
		loan.InterestRate,
		loan.MonthlyPayment,
		loan.TotalPayment,
		time.Now(),
		loan.ID,
	)
	return err
}

// Delete deletes a loan
func (r *LoanRepository) Delete(id string) error {
	query := `DELETE FROM loans WHERE id = $1`
	_, err := r.db.Exec(query, id)
	return err
}
