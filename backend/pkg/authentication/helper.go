package authentication

import (
	"log"
	"os"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func CreateToken(u User) (string, error) {
	var jwtKey = []byte(os.Getenv("JWT_SECRET"))

	jwtExpirationTime, _ := strconv.Atoi(os.Getenv("JWT_EXPIRATION_TIME"))
	expirationTime := time.Now().Add(time.Duration(jwtExpirationTime) * time.Minute)
	claims := &Claims{
		Email:  u.Email,
		Name:   u.Name,
		UserId: u.UserId,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtKey)
}

// DecodeJWT decodes a JWT token string and returns the token object or an error if the token is invalid.
func DecodeJWT(tokenString string) (*jwt.Token, error) {
	// Parse the token without validating the signature, as previously validated in the middleware
	token, _, err := new(jwt.Parser).ParseUnverified(tokenString, jwt.MapClaims{})
	if err != nil {
		return nil, err
	}

	// Extract claims and print them in a human-readable format
	if claims, ok := token.Claims.(jwt.MapClaims); ok {
		log.Printf("Decoded JWT Token: UserId: %s, Email: %s, Name: %s, Issued At: %v, Expires At: %v", claims["UserId"], claims["Email"], claims["Name"], claims["iat"], claims["exp"])
	} else {
		log.Printf("Unable to extract claims from token")
	}

	return token, nil
}
