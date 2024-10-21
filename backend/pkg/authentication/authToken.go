package authentication

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"fmt"
	"log"
	"time"
)

type AuthToken struct {
	Email     string
	Token     string
	CreatedAt time.Time
	ExpiredAt time.Time
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
	if time.Now().After(a.ExpiredAt) {
		return errors.New("token has already expired")
	}
	if !a.Purpose.IsValid() {
		return errors.New("invalid purpose")
	}
	return nil
}

func NewAuthToken(email string, purpose PurposeType, duration time.Duration) (*AuthToken, error) {
	token, err := generateToken()
	if err != nil {
		log.Printf("AuthToken: Failed to create auth token: %v", err)
		return nil, err
	}

	authToken := &AuthToken{
		Email:     email,
		Token:     token,
		CreatedAt: time.Now(),
		ExpiredAt: time.Now().Add(duration),
		Purpose:   purpose,
		Used:      false,
	}

	if err := authToken.Validate(); err != nil {
		return nil, err
	}

	return authToken, nil
}

func generateToken() (string, error) {
	tokenBytes := make([]byte, 32)
	_, err := rand.Read(tokenBytes)
	if err != nil {
		return "", fmt.Errorf("failed to generate random token: %w", err)
	}

	token := base64.URLEncoding.EncodeToString(tokenBytes) // Encode for url safety
	hash := sha256.Sum256([]byte(token))                   // Hashed token
	return hex.EncodeToString(hash[:]), nil
}
