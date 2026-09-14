package handlers

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"
)

const (
	sdkTokenTTL = 5 * time.Minute
	sdkIssuer   = "Fintillaa-loan-api"
	sdkAudience = "Fintillaa-premium-sdk"
)

type SDKHandler struct {
	jwtSecret []byte
	now       func() time.Time
}

type BankUser struct {
	ID         string  `json:"id"`
	Name       string  `json:"name"`
	Email      string  `json:"email"`
	Phone      string  `json:"phone"`
	LoanAmount float64 `json:"loan_amount"`
	TermMonths int     `json:"term_months"`
}

type sdkClaims struct {
	Issuer    string   `json:"iss"`
	Audience  string   `json:"aud"`
	Subject   string   `json:"sub"`
	ExpiresAt int64    `json:"exp"`
	IssuedAt  int64    `json:"iat"`
	NotBefore int64    `json:"nbf"`
	JTI       string   `json:"jti"`
	User      BankUser `json:"user"`
}

func NewSDKHandler(secret string) *SDKHandler {
	return &SDKHandler{
		jwtSecret: []byte(secret),
		now:       time.Now,
	}
}

func SDKSecretFromEnv() string {
	if secret := strings.TrimSpace(os.Getenv("JWT_SECRET")); secret != "" {
		return secret
	}
	return "Fintillaa-local-dev-secret-change-before-production-2026"
}

func (h *SDKHandler) Handshake(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSONError(w, http.StatusMethodNotAllowed, "method_not_allowed", "Use POST for SDK handshakes.")
		return
	}

	var user BankUser
	decoder := json.NewDecoder(http.MaxBytesReader(w, r.Body, 1<<20))
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(&user); err != nil {
		writeJSONError(w, http.StatusBadRequest, "invalid_payload", "Request body must be a valid bank user JSON object.")
		return
	}

	user.ID = strings.TrimSpace(user.ID)
	user.Name = strings.TrimSpace(user.Name)
	user.Email = strings.TrimSpace(user.Email)
	user.Phone = strings.TrimSpace(user.Phone)
	if user.ID == "" || user.Name == "" || user.Email == "" || user.Phone == "" {
		writeJSONError(w, http.StatusBadRequest, "missing_user_fields", "id, name, email, and phone are required.")
		return
	}

	issuedAt := h.now().UTC()
	claims := sdkClaims{
		Issuer:    sdkIssuer,
		Audience:  sdkAudience,
		Subject:   user.ID,
		IssuedAt:  issuedAt.Unix(),
		NotBefore: issuedAt.Add(-5 * time.Second).Unix(),
		ExpiresAt: issuedAt.Add(sdkTokenTTL).Unix(),
		JTI:       randomID(),
		User:      user,
	}

	token, err := h.signJWT(claims)
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "token_sign_failed", "Unable to create SDK token.")
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"sdk_token": token})
}

func (h *SDKHandler) Verify(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeJSONError(w, http.StatusMethodNotAllowed, "method_not_allowed", "Use GET for SDK verification.")
		return
	}

	token := bearerToken(r.Header.Get("Authorization"))
	if token == "" {
		token = strings.TrimSpace(r.URL.Query().Get("token"))
	}
	if token == "" {
		writeJSONError(w, http.StatusUnauthorized, "missing_token", "SDK token is required.")
		return
	}

	claims, err := h.verifyJWT(token)
	if err != nil {
		writeJSONError(w, http.StatusUnauthorized, "invalid_token", err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]BankUser{"user": claims.User})
}

func (h *SDKHandler) signJWT(claims sdkClaims) (string, error) {
	header := map[string]string{"alg": "HS256", "typ": "JWT"}
	headerJSON, err := json.Marshal(header)
	if err != nil {
		return "", err
	}
	claimsJSON, err := json.Marshal(claims)
	if err != nil {
		return "", err
	}

	unsigned := base64.RawURLEncoding.EncodeToString(headerJSON) + "." + base64.RawURLEncoding.EncodeToString(claimsJSON)
	signature := hmacSHA256(unsigned, h.jwtSecret)
	return unsigned + "." + base64.RawURLEncoding.EncodeToString(signature), nil
}

func (h *SDKHandler) verifyJWT(token string) (*sdkClaims, error) {
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return nil, errors.New("token must contain three JWT segments")
	}

	unsigned := parts[0] + "." + parts[1]
	expected := hmacSHA256(unsigned, h.jwtSecret)
	actual, err := base64.RawURLEncoding.DecodeString(parts[2])
	if err != nil {
		return nil, errors.New("token signature is not base64url encoded")
	}
	if !hmac.Equal(expected, actual) {
		return nil, errors.New("token signature is invalid")
	}

	var header struct {
		Algorithm string `json:"alg"`
		Type      string `json:"typ"`
	}
	headerBytes, err := base64.RawURLEncoding.DecodeString(parts[0])
	if err != nil {
		return nil, errors.New("token header is not base64url encoded")
	}
	if err := json.Unmarshal(headerBytes, &header); err != nil {
		return nil, errors.New("token header is invalid")
	}
	if header.Algorithm != "HS256" || header.Type != "JWT" {
		return nil, errors.New("token header algorithm is not accepted")
	}

	payloadBytes, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return nil, errors.New("token payload is not base64url encoded")
	}
	var claims sdkClaims
	if err := json.Unmarshal(payloadBytes, &claims); err != nil {
		return nil, errors.New("token payload is invalid")
	}

	now := h.now().UTC().Unix()
	if claims.Issuer != sdkIssuer || claims.Audience != sdkAudience {
		return nil, errors.New("token issuer or audience is invalid")
	}
	if claims.ExpiresAt <= now {
		return nil, errors.New("token has expired")
	}
	if claims.NotBefore > now {
		return nil, errors.New("token is not active yet")
	}
	if claims.Subject == "" || claims.Subject != claims.User.ID {
		return nil, errors.New("token subject is invalid")
	}

	return &claims, nil
}

func hmacSHA256(value string, secret []byte) []byte {
	mac := hmac.New(sha256.New, secret)
	mac.Write([]byte(value))
	return mac.Sum(nil)
}

func bearerToken(header string) string {
	const prefix = "Bearer "
	if len(header) > len(prefix) && strings.EqualFold(header[:len(prefix)], prefix) {
		return strings.TrimSpace(header[len(prefix):])
	}
	return ""
}

func randomID() string {
	var b [16]byte
	if _, err := rand.Read(b[:]); err != nil {
		return fmt.Sprintf("%d", time.Now().UnixNano())
	}
	return base64.RawURLEncoding.EncodeToString(b[:])
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(payload)
}

func writeJSONError(w http.ResponseWriter, status int, code string, message string) {
	writeJSON(w, status, map[string]string{
		"error":   code,
		"message": message,
	})
}
