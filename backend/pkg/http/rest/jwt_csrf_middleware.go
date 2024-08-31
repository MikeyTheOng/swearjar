package rest

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/golang-jwt/jwt/v5"
)

// ValidateProtectedRoutes validates JWT and CSRF token before allowing access to protected routes
func ProtectedRouteMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		Logging(r)

		// ! Debug
		// Log cookies received in the request
		// log.Printf("Cookies received in the request:")
		// for _, cookie := range r.Cookies() {
		//     log.Printf("Cookie: %s\n", cookie.Name)
		// }

		// Validate JWT
		err := validateJWT(r)
		if err != nil {
			log.Println("JWT validation error:", err)
			RespondWithError(w, http.StatusUnauthorized, err.Error())
			return
		}

		// Validate CSRF Token
		err = validateCSRFToken(r)
		if err != nil {
			log.Println("CSRF token validation error:", err)
			RespondWithError(w, http.StatusForbidden, err.Error())
			return
		}

		next.ServeHTTP(w, r)
	})
}

func Logging(r *http.Request) {
	log.Printf("Method: %s, Route: %s\n", r.Method, r.URL.Path)
}

func validateJWT(r *http.Request) error {
	var jwtKey = []byte(os.Getenv("JWT_SECRET"))
	cookie, err := r.Cookie("jwt")
	if err != nil {
		if err == http.ErrNoCookie {
			return errors.New("jwt cookie missing")
		}
		return err
	}

	tokenString := cookie.Value

	token, err := jwt.Parse(tokenString,
		func(token *jwt.Token) (interface{}, error) {
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
