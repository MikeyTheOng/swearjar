package rest

import (
	"encoding/json"
	"log"

	"net/http"
	"os"
	"strconv"
	"time"
)

// SetCookie sets a cookie with the provided name and value.
func SetCookie(w http.ResponseWriter, cookienName, value string, isHttpOnly bool) {
	isProdEnvVar := os.Getenv("PRODUCTION_ENV")
	isProdEnv, _ := strconv.ParseBool(isProdEnvVar)
	jwtExpirationTime, _ := strconv.Atoi(os.Getenv("JWT_EXPIRATION_TIME"))

	http.SetCookie(w, &http.Cookie{
		Name:     cookienName,
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
