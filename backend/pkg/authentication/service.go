package authentication

import (
	"errors"

	"golang.org/x/crypto/bcrypt"
)

var ErrUnauthorized = errors.New("unauthorized")

type Repository interface {
	SignUp(User) error
	GetUserByEmail(string) (User, error)
}

type Service interface {
	SignUp(User) error
	// Login() (User, error)
}

type service struct {
	r Repository
}

func NewService(r Repository) Service {
	return &service{r}
}

func (s *service) SignUp(u User) error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	u.Password = string(hashedPassword)
	return s.r.SignUp(u)
}

// func (s *service) Login() (User, error) {
// 	// bcrypt.CompareHashAndPassword
// 	return s.r.Login()
// }
