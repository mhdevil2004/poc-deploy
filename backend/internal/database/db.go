package database

import (
	"database/sql"
	"fmt"
	_ "github.com/lib/pq"
	"log"
	"os"
)

type DB struct {
	*sql.DB
}

// NewDB creates a new database connection
func NewDB() (*DB, error) {
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL != "" {
		db, err := sql.Open("postgres", databaseURL)
		if err != nil {
			return nil, err
		}

		if err := db.Ping(); err != nil {
			return nil, err
		}

		log.Println("Database connected successfully")
		return &DB{db}, nil
	}

	host := os.Getenv("DB_HOST")
	if host == "" {
		host = "localhost"
	}

	port := os.Getenv("DB_PORT")
	if port == "" {
		port = "5434"
	}

	user := os.Getenv("DB_USER")
	if user == "" {
		user = "postgres"
	}

	password := os.Getenv("DB_PASSWORD")
	if password == "" {
		password = "password"
	}

	dbname := os.Getenv("DB_NAME")
	if dbname == "" {
		dbname = "loan_db"
	}

	connStr := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname,
	)

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, err
	}

	if err := db.Ping(); err != nil {
		return nil, err
	}

	log.Println("Database connected successfully")
	return &DB{db}, nil
}

// Close closes the database connection
func (db *DB) Close() error {
	return db.DB.Close()
}

// Migrate creates the table if it doesn't exist
func (db *DB) Migrate() error {
	query := `
    CREATE TABLE IF NOT EXISTS loans (
        id SERIAL PRIMARY KEY,
        applicant_name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        term_months INT NOT NULL,
        interest_rate DECIMAL(5,2) NOT NULL,
        monthly_payment DECIMAL(10,2) NOT NULL,
        total_payment DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
	    `
	if _, err := db.DB.Exec(query); err != nil {
		return err
	}
	// Assessments extend the existing loan data rather than duplicating it.
	_, err := db.DB.Exec(`
	CREATE TABLE IF NOT EXISTS assessments (
	 id SERIAL PRIMARY KEY, loan_id INTEGER NOT NULL UNIQUE REFERENCES loans(id) ON DELETE CASCADE,
	 loan_reference VARCHAR(64) NOT NULL UNIQUE, business_name VARCHAR(150) NOT NULL DEFAULT '',
	 business_type VARCHAR(100) NOT NULL DEFAULT '', location VARCHAR(150) NOT NULL DEFAULT '',
	 status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','complete','flagged')),
	 score_band VARCHAR(32) NOT NULL DEFAULT 'UNVERIFIED' CHECK (score_band IN ('VERIFIED-STRONG','VERIFIED-ADEQUATE','VERIFIED-THIN','UNVERIFIED','CONTRADICTED')),
	 notes TEXT NOT NULL DEFAULT '', assigned_analyst VARCHAR(100) NOT NULL DEFAULT '',
	 deleted_at TIMESTAMPTZ NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
	 updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
	);
	CREATE TABLE IF NOT EXISTS audit_logs (
	 id SERIAL PRIMARY KEY, user_id VARCHAR(64) NOT NULL, user_name VARCHAR(100) NOT NULL,
	 role VARCHAR(32) NOT NULL, action VARCHAR(64) NOT NULL, resource VARCHAR(32) NOT NULL,
	 resource_id INTEGER NOT NULL, loan_reference VARCHAR(64), previous_value JSONB, new_value JSONB,
	 created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
	);
	CREATE TABLE IF NOT EXISTS loan_decisions (
	 id SERIAL PRIMARY KEY, assessment_id INTEGER NOT NULL REFERENCES assessments(id),
	 action VARCHAR(64) NOT NULL, status VARCHAR(32) NOT NULL,
	 performed_by VARCHAR(64) NOT NULL, performed_role VARCHAR(32) NOT NULL,
	 details JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
	);
	CREATE INDEX IF NOT EXISTS assessments_filter_idx ON assessments (status, score_band, created_at);
	CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON audit_logs (created_at DESC);
	CREATE INDEX IF NOT EXISTS loan_decisions_assessment_created_idx ON loan_decisions (assessment_id, created_at DESC);
	-- Keep the existing Partner Bank loan-submission flow visible to the admin
	-- portal without requiring a second write path or duplicate loan data.
	INSERT INTO assessments (loan_id, loan_reference, business_name, business_type, location)
	SELECT id, 'LN-ID-' || TO_CHAR(created_at AT TIME ZONE 'Asia/Jakarta', 'YYYY') || '-' || LPAD(id::text, 5, '0'), '', '', ''
	FROM loans ON CONFLICT (loan_id) DO NOTHING;
	CREATE OR REPLACE FUNCTION create_assessment_for_loan() RETURNS trigger AS $$
	DECLARE assessment_id INTEGER; loan_ref VARCHAR(64);
	BEGIN
	  loan_ref := 'LN-ID-' || TO_CHAR(NEW.created_at AT TIME ZONE 'Asia/Jakarta', 'YYYY') || '-' || LPAD(NEW.id::text, 5, '0');
	  INSERT INTO assessments (loan_id, loan_reference, business_name, business_type, location)
	  VALUES (NEW.id, loan_ref, '', '', '') RETURNING id INTO assessment_id;
	  INSERT INTO audit_logs (user_id,user_name,role,action,resource,resource_id,loan_reference,new_value)
	  VALUES ('SYSTEM','System','System','CREATED_ASSESSMENT','assessment',assessment_id,loan_ref,jsonb_build_object('status','pending','score_band','UNVERIFIED'));
	  RETURN NEW;
	END; $$ LANGUAGE plpgsql;
	DROP TRIGGER IF EXISTS loans_create_assessment ON loans;
	CREATE TRIGGER loans_create_assessment AFTER INSERT ON loans FOR EACH ROW EXECUTE FUNCTION create_assessment_for_loan();
	-- Development demonstration records live in PostgreSQL (never in React), and
	-- are added only to an otherwise empty installation.
	INSERT INTO loans (applicant_name,email,amount,term_months,interest_rate,monthly_payment,total_payment,status)
	SELECT v.applicant_name,v.email,v.amount,v.term_months,7.5,v.amount/v.term_months,v.amount*1.075,'pending'
	FROM (VALUES
	 ('Budi Santoso','demo-budi@fintilla.local',25000000::numeric,24),
	 ('Sari Dewi','demo-sari@fintilla.local',40000000::numeric,24),
	 ('Rizky Pratama','demo-rizky@fintilla.local',18000000::numeric,18),
	 ('Maya Putri','demo-maya@fintilla.local',30000000::numeric,24),
	 ('Doni Pratama','demo-doni@fintilla.local',15000000::numeric,12)
	) AS v(applicant_name,email,amount,term_months)
	WHERE NOT EXISTS (SELECT 1 FROM loans WHERE email = v.email);
	UPDATE assessments a SET business_name=v.business_name,business_type=v.business_type,location=v.location,status=v.status,score_band=v.score_band,notes=v.notes
	FROM loans l JOIN (VALUES
	 ('demo-budi@fintilla.local','Warung Budi','Grocery / Provision Store','Jakarta Selatan, DKI Jakarta','complete','VERIFIED-STRONG','Solid affordability and high reconciliation confidence.'),
	 ('demo-sari@fintilla.local','Toko Sari','Retail','Jakarta Barat, DKI Jakarta','complete','VERIFIED-ADEQUATE','Affordability and reconciliation support lending.'),
	 ('demo-rizky@fintilla.local','Kedai Rizky','Food Service','Bandung, Jawa Barat','pending','VERIFIED-THIN','Independent verification is available but sparse.'),
	 ('demo-maya@fintilla.local','Studio Maya','Services','Surabaya, Jawa Timur','pending','UNVERIFIED','Insufficient independent evidence so far.'),
	 ('demo-doni@fintilla.local','Toko Doni','Electronics','Bogor, Jawa Barat','flagged','CONTRADICTED','Evidence conflicts with borrower claims.')
	) AS v(email,business_name,business_type,location,status,score_band,notes) ON l.email=v.email
	WHERE a.loan_id=l.id;
	-- Populate the full lender-portal demonstration portfolio in PostgreSQL.
	-- The employee assessments screen reads these rows from the API; it no
	-- longer relies on a separate React-only mock list.
	INSERT INTO loans (applicant_name,email,amount,term_months,interest_rate,monthly_payment,total_payment,status)
	SELECT v.applicant_name,v.email,v.amount,24,7.5,v.amount/24,v.amount*1.075,'pending'
	FROM (VALUES
	 ('Siti Aminah','demo-siti@fintilla.local',30000000::numeric),
	 ('Agus Pratama','demo-agus@fintilla.local',22000000::numeric),
	 ('Rina Wijaya','demo-rina@fintilla.local',45000000::numeric),
	 ('Joko Anwar','demo-joko@fintilla.local',60000000::numeric),
	 ('Arief Rahman','demo-arief@fintilla.local',35000000::numeric),
	 ('Iwan Setiawan','demo-iwan@fintilla.local',28000000::numeric),
	 ('Dewi Lestari','demo-dewi@fintilla.local',20000000::numeric),
	 ('Bambang Pamungkas','demo-bambang@fintilla.local',75000000::numeric),
	 ('Fitri Handayani','demo-fitri@fintilla.local',40000000::numeric),
	 ('Rizal Firmansyah','demo-rizal@fintilla.local',80000000::numeric),
	 ('Lina Purnama','demo-lina@fintilla.local',35000000::numeric),
	 ('Eko Prasetyo','demo-eko@fintilla.local',90000000::numeric)
	) AS v(applicant_name,email,amount)
	WHERE NOT EXISTS (SELECT 1 FROM loans WHERE email=v.email);
	UPDATE assessments a SET business_name=v.business_name,business_type=v.business_type,location=v.location,status=v.status,score_band=v.score_band,notes=v.notes
	FROM loans l JOIN (VALUES
	 ('demo-siti@fintilla.local','Toko Baju Siti','Clothing Shop','Bandung, Jawa Barat','pending','VERIFIED-THIN','Assessment is under review.'),
	 ('demo-agus@fintilla.local','Warung Kopi Agus','Food Stall / Warung Makan','Surabaya, Jawa Timur','flagged','CONTRADICTED','Manual review is required.'),
	 ('demo-rina@fintilla.local','Rina Elektronik','Electronics Shop','Yogyakarta, DI Yogyakarta','complete','VERIFIED-STRONG','Strong assessment outcome.'),
	 ('demo-joko@fintilla.local','Toko Bangunan Joko','Hardware / Building Materials','Semarang, Jawa Tengah','pending','UNVERIFIED','Documents are pending.'),
	 ('demo-arief@fintilla.local','Apotek Sehat','Pharmacy / Apotek','Makassar, Sulawesi Selatan','complete','VERIFIED-STRONG','Assessment completed.'),
	 ('demo-iwan@fintilla.local','Iwan Fotokopi & ATK','Stationery / Printing','Medan, Sumatera Utara','flagged','CONTRADICTED','Risk factors require review.'),
	 ('demo-dewi@fintilla.local','Salon Dewi','Beauty Salon','Jakarta Timur, DKI Jakarta','flagged','CONTRADICTED','Manual review is required.'),
	 ('demo-bambang@fintilla.local','Bengkel Bambang','Auto Repair Workshop','Bekasi, Jawa Barat','pending','VERIFIED-ADEQUATE','Verification is in progress.'),
	 ('demo-fitri@fintilla.local','Warung Makan Fitri','Small Restaurant / Rumah Makan','Sleman, DI Yogyakarta','complete','VERIFIED-STRONG','Low-risk assessment.'),
	 ('demo-rizal@fintilla.local','Toko Makmur','Grocery / Provision Store','Makassar, Sulawesi Selatan','complete','VERIFIED-STRONG','High-confidence assessment.'),
	 ('demo-lina@fintilla.local','Toko Kosmetik Lina','Cosmetics / Beauty Products','Jakarta Barat, DKI Jakarta','flagged','VERIFIED-ADEQUATE','Risk review is required.'),
	 ('demo-eko@fintilla.local','Toko Material Eko','Building Materials','Yogyakarta, DI Yogyakarta','flagged','VERIFIED-ADEQUATE','Manual review is required.')
	) AS v(email,business_name,business_type,location,status,score_band,notes) ON l.email=v.email
	WHERE a.loan_id=l.id;
	`)
	return err
}
