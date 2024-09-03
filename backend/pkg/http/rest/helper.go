package rest

import (
	"encoding/json"
	"log"

	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/mikeytheong/swearjar/backend/pkg/authentication"
)

// SetCookie sets a cookie with the provided name and value.
func SetCookie(w http.ResponseWriter, cookieName, value string, isHttpOnly bool) {
	isProdEnvVar := os.Getenv("PRODUCTION_ENV")
	isProdEnv, _ := strconv.ParseBool(isProdEnvVar)
	jwtExpirationTime, _ := strconv.Atoi(os.Getenv("JWT_EXPIRATION_TIME"))

	http.SetCookie(w, &http.Cookie{
		Name:     cookieName,
		Value:    value,
		HttpOnly: isHttpOnly, // ! determines if cookie is HttpOnly / non-HttpOnly
		Secure:   isProdEnv,
		SameSite: http.SameSiteNoneMode,
		Path:     "/",
		Expires:  time.Now().Add(time.Duration(jwtExpirationTime) * time.Minute), // Set the expiration time to be same as that of jwt
	})
}

func RespondWithError(w http.ResponseWriter, statusCode int, message string) {
	w.WriteHeader(statusCode)
	err := json.NewEncoder(w).Encode(map[string]string{"error": message})
	if err != nil {
		log.Printf("Error encoding JSON error response: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
	}
}

func GetUserIdFromCookie(w http.ResponseWriter, r *http.Request) (string, error) {
	cookie, err := r.Cookie("jwt")
	if err != nil {
		return "", err
	}
	claims, err := authentication.DecodeJWT(cookie.Value)
	if err != nil {
		log.Printf("Error decoding JWT: %v", err)
		return "", err
	}

	userId, ok := claims["UserId"].(string)
	if !ok {
		return "", err
	}

	return userId, nil
}
