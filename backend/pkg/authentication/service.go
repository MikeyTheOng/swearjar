package authentication

import (
	"errors"
	"log"
	"net/url"
	"os"
	"regexp"
	"strings"
	"time"

	"html/template"

	"github.com/golang-jwt/jwt/v5"
	"github.com/mikeytheong/swearjar/backend/pkg/email"
	"golang.org/x/crypto/bcrypt"
)

const (
	AuthTokenDuration = 1 * time.Hour
)

var ErrUnauthorized = errors.New("unauthorized")
var ErrNoDocuments = errors.New("no documents found")
var ErrInvalidToken = errors.New("invalid token")

type Claims struct {
	Email  string
	Name   string
	UserId string
	jwt.RegisteredClaims
}

type Repository interface {
	SignUp(User) error
	GetUserByEmail(string) (User, error)
	CreateAuthToken(AuthToken) error
	GetAuthToken(string) (AuthToken, error)
	UpdatePasswordAndMarkToken(email string, newPassword string, hashedToken string) error
}

type Service interface {
	SignUp(User) error
	Login(User) (u UserResponse, jwt string, csrfToken string, err error)
	ForgotPassword(email string) error
	ResetPassword(token string, newPassword string) error
	VerifyUserByEmail(email string) (UserResponse, error)
	VerifyAuthToken(token string, purpose string) error
}

type service struct {
	r Repository
	e email.Service
}

func NewService(r Repository, e email.Service) Service {
	return &service{r, e}
}

func (s *service) SignUp(u User) error {
	// Check if email is valid
	emailRegex := `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`
	re := regexp.MustCompile(emailRegex)
	if !re.MatchString(u.Email) {
		log.Printf("Invalid email format: %s", u.Email)
		return errors.New("invalid email format")
	}

	// Check if email is used
	result, err := s.r.GetUserByEmail(u.Email)
	if err != nil && !errors.Is(err, ErrNoDocuments) {
		log.Printf("Error fetching user by email: %v", err)
		return err
	}
	if result.Email == u.Email {
		log.Printf("User with email{%s} already exists", u.Email)
		return errors.New("User already exists")
	}

	// Validate password
	if err := validatePassword(u.Password); err != nil {
		return err
	}

	// Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("Error hashing password: %v", err)
		return err
	}
	u.Password = string(hashedPassword)

	// Convert email to lowercase
	u.Email = strings.ToLower(u.Email)

	// Insert the user into the database
	err = s.r.SignUp(u)
	if err != nil {
		log.Printf("Error inserting user into database: %v", err)
		return err
	}

	log.Printf("User signed up successfully: %s", u.Email)
	return nil
}

func (s *service) Login(u User) (ur UserResponse, jwt string, csrfToken string, err error) {
	storedUser, err := s.r.GetUserByEmail(u.Email)
	if err != nil {
		return UserResponse{}, "", "", err
	}

	err = bcrypt.CompareHashAndPassword([]byte(storedUser.Password), []byte(u.Password))
	if err != nil {
		if errors.Is(err, bcrypt.ErrMismatchedHashAndPassword) {
			return UserResponse{}, "", "", ErrUnauthorized
		}
		return UserResponse{}, "", "", err
	}

	tokenString, err := CreateToken(storedUser)
	if err != nil {
		return UserResponse{}, "", "", err
	}

	csrfToken, err = GenerateCSRFToken()
	if err != nil {
		return UserResponse{}, "", "", err
	}

	return UserResponse{
		UserId: storedUser.UserId,
		Email:  storedUser.Email,
		Name:   storedUser.Name,
	}, tokenString, csrfToken, nil
}

func (s *service) ForgotPassword(email string) error {
	// * 1. Verify email exists
	user, err := s.r.GetUserByEmail(email)
	if err != nil {
		log.Printf("AuthService: Error initiating Forget Password for email {%v}: %v", email, err)
		return err
	}

	// * 2. Generate raw token
	rawToken, err := generateToken()
	if err != nil {
		log.Printf("AuthService: Error generating token: %v", err)
		return err
	}
	encodedToken := url.QueryEscape(rawToken)

	// * 3. Create auth token and store in db
	authToken, err := NewAuthToken(email, encodedToken, PurposePasswordReset, AuthTokenDuration)
	if err != nil {
		log.Printf("AuthService: Error creating auth token: %v", err)
		return err
	}
	err = s.r.CreateAuthToken(*authToken)
	if err != nil {
		log.Printf("AuthService: Error storing auth token in db: %v", err)
		return err
	}

	// * 4. Send email with password reset link
	htmlTemplate := `
		<!DOCTYPE html>
		<html>
			<body>
				<p>Hello {{.Name}},</p>
				
				<p>
					We received a request to reset your password. If you made this request, please click the link below to set a new password:
					<br>
					<a href="{{.ResetLink}}">{{.ResetLink}}</a>
				</p>
				
				<p>
					If you did not request a password reset, please ignore this email or contact us if you have any concerns.
				</p>
			</body>
		</html>
	`

	data := struct {
		Name      string
		ResetLink string
	}{
		Name:      user.Name,
		ResetLink: os.Getenv("FRONTEND_URL") + "/auth/password/reset?token=" + encodedToken,
	}

	tmpl, err := template.New("resetPassword").Parse(htmlTemplate)
	if err != nil {
		log.Printf("AuthService: Error parsing template: %v", err)
		return err
	}

	if err := s.e.SendEmail(email, "Forgot Password Request - SwearJar", tmpl, data); err != nil {
		log.Printf("AuthService: Error sending password-reset email")
		return err
	}
	log.Printf("AuthService: Password-reset email sent to %s", email)
	return nil
}

func (s *service) ResetPassword(token string, newPassword string) error {
	authToken, err := s.verifyAndGetAuthToken(token, string(PurposePasswordReset))
	if err != nil {
		log.Printf("AuthService: Error verifying auth token: %v", err)
		return ErrInvalidToken
	}

	// Validate password
	if err := validatePassword(newPassword); err != nil {
		return err
	}

	// Hash the new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	// Update password and mark token as used in a single transaction
	err = s.r.UpdatePasswordAndMarkToken(authToken.Email, string(hashedPassword), encryptToken(token))
	if err != nil {
		log.Printf("AuthService: Error updating password and marking token: %v", err)
		return err
	}

	return nil
}

func (s *service) VerifyUserByEmail(email string) (UserResponse, error) {
	// TODO
	return UserResponse{}, nil
}

func (s *service) verifyAndGetAuthToken(token, purpose string) (*AuthToken, error) {
	hashedToken := encryptToken(token)
	authToken, err := s.r.GetAuthToken(hashedToken)
	if err != nil {
		if errors.Is(err, ErrNoDocuments) {
			log.Printf("AuthService: Token not found: %v", err)
			return nil, ErrInvalidToken
		}
		log.Printf("AuthService: Error getting auth token: %v", err)
		return nil, ErrInvalidToken
	}

	if err := authToken.Validate(); err != nil {
		log.Printf("AuthService: Invalid token: %v", err)
		return nil, ErrInvalidToken
	}

	if authToken.Purpose != PurposeType(purpose) {
		log.Printf("AuthService: Token purpose mismatch: expected %s, got %s", purpose, authToken.Purpose)
		return nil, ErrInvalidToken
	}

	return &authToken, nil
}

func (s *service) VerifyAuthToken(token string, purpose string) error {
	_, err := s.verifyAndGetAuthToken(token, purpose)
	return err
}
