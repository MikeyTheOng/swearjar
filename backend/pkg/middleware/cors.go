package middleware

import (
	"errors"
	"fmt"
	"net/http"
	"os"
	"strings"
)

var allowedOrigins = strings.Split(os.Getenv("ALLOWED_ORIGINS"), ",")

func CORSMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		err := validateCORS(origin)
		if err != nil {
			fmt.Println("CORS validation error:", err)
			http.Error(w, err.Error(), http.StatusForbidden)
			return
		}

		// Set CORS headers
		w.Header().Set("Access-Control-Allow-Origin", origin)
		w.Header().Set("Access-Control-Allow-Methods", "DELETE, GET, PATCH, POST, PUT, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type")

		// Handle preflight request
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func validateCORS(origin string) error {
	for _, allowedOrigin := range allowedOrigins {
		if origin == allowedOrigin {
			return nil
		}
	}
	return errors.New("CORS policy: This origin is not allowed")
}
