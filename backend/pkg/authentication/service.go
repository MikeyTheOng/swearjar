package authentication

import (
	"crypto/rand"
	"encoding/base64"
	"errors"
	"log"
	"regexp"
	"strings"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

var ErrUnauthorized = errors.New("unauthorized")
var ErrNoDocuments = errors.New("no documents found")

type Claims struct {
	Email  string
	Name   string
	UserId string
	jwt.RegisteredClaims
}

type Repository interface {
	SignUp(User) error
	GetUserByEmail(string) (User, error)
}

type Service interface {
	SignUp(User) error
	Login(User) (u UserResponse, jwt string, csrfToken string, err error)
}

type service struct {
	r Repository
}

func NewService(r Repository) Service {
	return &service{r}
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

	// Check if password is empty
	if u.Password == "" {
		log.Printf("Password is required")
		return errors.New("password is required")
	}

	// Validate password length
	if len(u.Password) < 8 {
		log.Printf("Password must be at least 8 characters")
		return errors.New("password must be at least 8 characters")
	}
	if len(u.Password) >= 30 {
		log.Printf("Password must be less than 30 characters")
		return errors.New("password must be less than 30 characters")
	}

	// Validate password contains at least one uppercase letter
	if !regexp.MustCompile(`[A-Z]`).MatchString(u.Password) {
		log.Printf("Password must contain at least one uppercase letter")
		return errors.New("password must contain at least one uppercase letter")
	}

	// Validate password contains at least one special character
	if !regexp.MustCompile(`[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]`).MatchString(u.Password) {
		log.Printf("Password must contain at least one special character")
		return errors.New("password must contain at least one special character")
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

	csrfToken, err = generateCSRFToken()
	if err != nil {
		return UserResponse{}, "", "", err
	}

	return UserResponse{
		UserId: storedUser.UserId,
		Email:  storedUser.Email,
		Name:   storedUser.Name,
	}, tokenString, csrfToken, nil
}

func generateCSRFToken() (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(bytes), nil
}
