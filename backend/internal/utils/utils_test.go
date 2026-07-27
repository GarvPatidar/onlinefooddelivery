package utils

import (
	"testing"
)

func TestPasswordHashing(t *testing.T) {
	password := "mysecretpassword123"

	// 1. Hash the password
	hash, err := HashPassword(password)
	if err != nil {
		t.Fatalf("failed to hash password: %v", err)
	}

	if hash == password {
		t.Fatalf("hashed password should not be equal to plain text password")
	}

	// 2. Compare correct password
	if !CheckPasswordHash(password, hash) {
		t.Fatalf("expected password verification to pass")
	}

	// 3. Compare wrong password
	if CheckPasswordHash("wrongpassword", hash) {
		t.Fatalf("expected password verification to fail for incorrect password")
	}
}

func TestJWTGenerationAndValidation(t *testing.T) {
	userID := "12345678-1234-1234-1234-1234567890ab"
	role := "customer"
	secret := "mytestsecretkey123"

	// 1. Generate Token
	token, _, err := GenerateToken(userID, role, secret)
	if err != nil {
		t.Fatalf("failed to generate JWT token: %v", err)
	}

	if token == "" {
		t.Fatalf("token should not be empty")
	}

	// 2. Validate Token
	claims, err := ValidateToken(token, secret)
	if err != nil {
		t.Fatalf("failed to validate valid token: %v", err)
	}

	if claims.UserID != userID {
		t.Errorf("expected userID %s, got %s", userID, claims.UserID)
	}

	if claims.Role != role {
		t.Errorf("expected role %s, got %s", role, claims.Role)
	}

	// 3. Validate Token with wrong secret
	_, err = ValidateToken(token, "wrongsecretkey")
	if err == nil {
		t.Fatalf("expected error when validating token with wrong secret key")
	}
}
