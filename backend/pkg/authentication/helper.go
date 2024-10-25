package authentication

import (
	"crypto/rand"
	"encoding/base64"
	"errors"
	"log"
	"os"
	"regexp"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func CreateToken(u User) (string, error) {
	var jwtKey = []byte(os.Getenv("JWT_SECRET"))

	jwtExpirationTime, _ := strconv.Atoi(os.Getenv("JWT_EXPIRATION_TIME"))
	expirationTime := time.Now().Add(time.Duration(jwtExpirationTime) * time.Minute)
	claims := &Claims{
		Email:    u.Email,
		Name:     u.Name,
		UserId:   u.UserId,
		Verified: u.Verified,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtKey)
}

// DecodeJWT decodes a JWT token string and returns the token object or an error if the token is invalid.
func DecodeJWT(tokenString string) (jwt.MapClaims, error) {
	// Parse the token without validating the signature, as previously validated in the middleware
	token, _, err := new(jwt.Parser).ParseUnverified(tokenString, jwt.MapClaims{})
	if err != nil {
		return nil, err
	}

	// Extract claims and print them in a human-readable format
	if claims, ok := token.Claims.(jwt.MapClaims); ok {
		log.Printf("Decoded JWT Token: UserId: %s, Email: %s, Name: %s, Issued At: %v, Expires At: %v", claims["UserId"], claims["Email"], claims["Name"], claims["iat"], claims["exp"])
		return claims, nil
	} else {
		log.Printf("Unable to extract claims from token")
		return nil, errors.New("Unable to extract claims from token")
	}
}

func GenerateCSRFToken() (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(bytes), nil
}

func validatePassword(password string) error {
	if password == "" {
		return errors.New("password is required")
	}

	if len(password) < 8 {
		return errors.New("password must be at least 8 characters")
	}

	if len(password) >= 30 {
		return errors.New("password must be less than 30 characters")
	}

	if !regexp.MustCompile(`[A-Z]`).MatchString(password) {
		return errors.New("password must contain at least one uppercase letter")
	}

	if !regexp.MustCompile(`[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]`).MatchString(password) {
		return errors.New("password must contain at least one special character")
	}

	return nil
}
