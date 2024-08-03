package middleware

import (
	"errors"
	"fmt"
	"net/http"
	"os"

	"github.com/golang-jwt/jwt/v5"
)

// ValidateProtectedRoutes validates JWT and CSRF token before allowing access to protected routes
func ProtectedRouteMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		Logging(r)

		// Validate JWT
		err := validateJWT(r)
		if err != nil {
			fmt.Println("JWT validation error:", err)
			http.Error(w, err.Error(), http.StatusUnauthorized)
			return
		}

		// Validate CSRF Token
		err = validateCSRFToken(r)
		if err != nil {
			fmt.Println("CSRF token validation error:", err)
			http.Error(w, err.Error(), http.StatusForbidden)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func Logging(r *http.Request) {
	fmt.Printf("Method: %s, Route: %s\n", r.Method, r.URL.Path)
}

func validateJWT(r *http.Request) error {
	var jwtKey = []byte(os.Getenv("JWT_SECRET"))
	fmt.Println("JWT Secret (Validation):", jwtKey) // ! Debugging JWT Secret
	cookie, err := r.Cookie("jwt")
	if err != nil {
		if err == http.ErrNoCookie {
			return errors.New("jwt cookie missing")
		}
		return err
	}

	tokenString := cookie.Value
	fmt.Println("Token string:", tokenString) // ! Debugging token string

	token, err := jwt.Parse(tokenString,
		func(token *jwt.Token) (interface{}, error) {
			fmt.Println("Signing method:", token.Method) // ! Debugging signing method
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return jwtKey, nil
		},
	)
	if err != nil { // check for parsing errors first
		return err
	}
	if !token.Valid {
		return errors.New("invalid token")
	}

	return nil
}

func validateCSRFToken(r *http.Request) error {
	// Retrieve CSRF token from non-HttpOnly cookie
	nonHttpOnlyCookie, err := r.Cookie("csrf_token")
	if err != nil {
		if err == http.ErrNoCookie {
			return errors.New("csrf token cookie missing")
		}
		return err
	}

	// Retrieve CSRF token from HttpOnly cookie
	httpOnlyCookie, err := r.Cookie("csrf_token_http_only")
	if err != nil {
		if err == http.ErrNoCookie {
			return errors.New("csrf token http only cookie missing")
		}
		return err
	}

	// Compare the tokens
	if nonHttpOnlyCookie.Value != httpOnlyCookie.Value {
		return errors.New("invalid csrf token")
	}

	return nil
}
