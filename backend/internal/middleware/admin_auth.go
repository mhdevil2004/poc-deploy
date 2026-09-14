package middleware

import (
	"context"
	"net/http"
	"strings"
)

type AdminIdentity struct{ ID, Name, Role string }
type adminIdentityKey struct{}

var adminIdentities = map[string]AdminIdentity{
	"USR-001": {"USR-001", "Andi Wijaya", "Administrator"},
	"USR-002": {"USR-002", "Siti Rahma", "Risk Officer"},
	"USR-003": {"USR-003", "Budi Hartono", "Underwriter"},
	"USR-004": {"USR-004", "Dewi Lestari", "Read-Only Auditor"},
}

// The lender "employee" portal is the primary assessment workspace. Its
// prototype login uses employee IDs, so map the assessment-capable employees
// to the same server-side roles used by the assessment API.
var employeeIdentities = map[string]AdminIdentity{
	"EMP001": {"EMP001", "Ahmad Rizki", "Loan Officer"},
	"EMP002": {"EMP002", "Akila", "Underwriter"},
	"EMP003": {"EMP003", "Budi Hartono", "Branch Manager"},
	"EMP004": {"EMP004", "Indah Permata", "Operations Officer"},
	"EMP005": {"EMP005", "Admin Fintilla", "Administrator"},
	"EMP006": {"EMP006", "Reza Pratama", "Loan Officer"},
	"EMP007": {"EMP007", "Nina Kusuma", "Risk Officer"},
	"EMP008": {"EMP008", "Wahyu Nugroho", "Operations Officer"},
	"EMP009": {"EMP009", "Andi Wijaya", "Read-Only Auditor"},
}

func AdminIdentityFromRequest(r *http.Request) (AdminIdentity, bool) {
	raw := strings.TrimPrefix(r.Header.Get("Authorization"), "Bearer ")
	const adminPrefix = "mock_admin_token_"
	const employeePrefix = "mock_emp_token_"
	if strings.HasPrefix(raw, employeePrefix) {
		id := strings.Split(strings.TrimPrefix(raw, employeePrefix), "_")[0]
		v, ok := employeeIdentities[id]
		return v, ok
	}
	if !strings.HasPrefix(raw, adminPrefix) {
		return AdminIdentity{}, false
	}
	rest := strings.TrimPrefix(raw, adminPrefix)
	id := strings.Split(rest, "_")[0]
	v, ok := adminIdentities[id]
	return v, ok
}
func RequireAdmin(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		identity, ok := AdminIdentityFromRequest(r)
		if !ok {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte(`{"error":{"code":"UNAUTHENTICATED","message":"Authentication required"}}`))
			return
		}
		next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), adminIdentityKey{}, identity)))
	}
}
