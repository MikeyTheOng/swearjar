package authentication

import (
	"golang.org/x/crypto/bcrypt"
)

type Repository interface {
	SignUp() error
	Login() (User, error)
}

type Service interface {
	SignUp() error
	Login() (User, error)
}

type service struct {
	r Repository
}

func NewService(r Repository) Service {
	return &service{r}
}

func (s *service) SignUp(u User) error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
	return s.r.SignUp()
}

func (s *service) Login() (User, error) {
	return s.r.Login()
}
