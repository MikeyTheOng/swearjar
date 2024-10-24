package authentication

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"fmt"
	"time"
)

type AuthToken struct {
	Email     string
	Token     string
	CreatedAt time.Time
	ExpiresAt time.Time
	Purpose   PurposeType
	Used      bool
}

func (a *AuthToken) Validate() error {
	if a.Email == "" {
		return errors.New("email is required")
	}
	if a.Token == "" {
		return errors.New("token is required")
	}
	if time.Now().After(a.ExpiresAt) {
		return errors.New("token has already expired")
	}
	if !a.Purpose.IsValid() {
		return errors.New("invalid purpose")
	}
	return nil
}

func NewAuthToken(email string, rawToken string, purpose PurposeType, duration time.Duration) (*AuthToken, error) {
	encryptedToken := encryptToken(rawToken)

	authToken := &AuthToken{
		Email:     email,
		Token:     encryptedToken,
		CreatedAt: time.Now(),
		ExpiresAt: time.Now().Add(duration),
		Purpose:   purpose,
		Used:      false,
	}

	if err := authToken.Validate(); err != nil {
		return nil, err
	}

	return authToken, nil
}

func encryptToken(token string) string {
	hash := sha256.Sum256([]byte(token))
	return hex.EncodeToString(hash[:])
}

func generateToken() (string, error) {
	tokenBytes := make([]byte, 32)
	_, err := rand.Read(tokenBytes)
	if err != nil {
		return "", fmt.Errorf("failed to generate random token: %w", err)
	}

	return base64.URLEncoding.EncodeToString(tokenBytes), nil
}
