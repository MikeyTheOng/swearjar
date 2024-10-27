package rest

import (
	"errors"
	"fmt"
	// "log"
	"net/http"
	"os"
	"strings"
)

func CORSMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		err := validateCORS(origin)
		if err != nil {
			fmt.Println("CORS validation error:", err)
			RespondWithError(w, http.StatusForbidden, err.Error())
			return
		}

		// Set CORS headers
		w.Header().Set("Access-Control-Allow-Origin", origin)
		w.Header().Set("Access-Control-Allow-Methods", "DELETE, GET, PATCH, POST, PUT, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		// Handle preflight request
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func validateCORS(origin string) error {
	// log.Printf("Incoming request is from origin: %s", origin)
	var allowedOrigins = strings.Split(os.Getenv("ALLOWED_ORIGINS"), ",")
	for _, allowedOrigin := range allowedOrigins {
		if origin == allowedOrigin {
			// log.Printf("Origin %s is allowed", origin)
			return nil
		}
	}
	return errors.New("CORS policy: This origin is not allowed")
}
