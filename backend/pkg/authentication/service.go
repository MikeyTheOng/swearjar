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
	"golang.org/x/crypto/bcrypt"
)

var ErrUnauthorized = errors.New("unauthorized")
var ErrNoDocuments = errors.New("no documents found")

type Claims struct {
	Email string `json:"email"`
	Name  string `json:"name"`
	jwt.RegisteredClaims
}

type Repository interface {
	SignUp(User) error
	GetUserByEmail(string) (User, error)
}

type Service interface {
	SignUp(User) error
	Login(User) (jwt string, csrfToken string, err error)
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

	// Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("Error hashing password: %v", err)
		return err
	}
	u.Password = string(hashedPassword)

	// Insert the user into the database
	err = s.r.SignUp(u)
	if err != nil {
		log.Printf("Error inserting user into database: %v", err)
		return err
	}

	log.Printf("User signed up successfully: %s", u.Email)
	return nil
}

func (s *service) Login(u User) (jwt string, csrfToken string, err error) {
	storedUser, err := s.r.GetUserByEmail(u.Email)
	if err != nil {
		return "", "", err
	}

	err = bcrypt.CompareHashAndPassword([]byte(storedUser.Password), []byte(u.Password))
	if err != nil {
		if errors.Is(err, bcrypt.ErrMismatchedHashAndPassword) {
			return "", "", ErrUnauthorized
		}
		return "", "", err
	}

	tokenString, err := CreateToken(storedUser)
	if err != nil {
		return "", "", err
	}

	csrfToken, err = generateCSRFToken()
	if err != nil {
		return "", "", err
	}

	return tokenString, csrfToken, nil
}

func CreateToken(u User) (string, error) {
	var jwtKey = []byte(os.Getenv("JWT_SECRET"))

	jwtExpirationTime, _ := strconv.Atoi(os.Getenv("JWT_EXPIRATION_TIME"))
	expirationTime := time.Now().Add(time.Duration(jwtExpirationTime) * time.Minute)
	claims := &Claims{
		Email: u.Email,
		Name:  u.Name,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtKey)
}

func generateCSRFToken() (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(bytes), nil
}
