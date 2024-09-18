package swearJar

import (
	"errors"
	"log"
	"time"

	"github.com/mikeytheong/swearjar/backend/pkg/authentication"
)

type Service interface {
	AddSwear(Swear) error
	CreateSwearJar(Name string, Desc string, Owners []string) (SwearJar, error)
	GetSwearJarById(swearJarId string, userId string) (SwearJar, error)
	GetSwearJarsByUserId(userId string) ([]SwearJar, error)
	GetSwears(swearJarId string, userId string) ([]Swear, error)
	SwearJarTrend(swearJarId string, userId string, period string) (SwearJar, error)
}

type Repository interface {
	AddSwear(Swear) error
	CreateSwearJar(SwearJar) (SwearJar, error)
	GetSwearJarById(swearJarId string) (SwearJar, error)
	GetSwearJarOwners(swearJarId string) (owners []string, err error)
	GetSwearJarsByUserId(swearJarId string) ([]SwearJar, error)
	GetSwears(swearJarId string, limit int) ([]Swear, error)
}

type service struct {
	r Repository
}

// NewService creates an adding service with the necessary dependencies
func NewService(r Repository) Service {
	return &service{r}
}

func (s *service) CreateSwearJar(Name string, Desc string, Owners []string) (SwearJar, error) {
	sj := SwearJar{
		Name:      Name,
		Desc:      Desc,
		Owners:    Owners,
		CreatedAt: time.Now(),
	}

	return s.r.CreateSwearJar(sj)
}

func (s *service) AddSwear(swear Swear) error {
	if isOwner, err := s.IsOwner(swear.SwearJarId, swear.UserId); err != nil {
		return err
	} else if !isOwner {
		log.Printf("User ID: %s is not an owner of SwearJar ID: %s", swear.UserId, swear.SwearJarId)
		return authentication.ErrUnauthorized
	}

	return s.r.AddSwear(swear)
}

func (s *service) GetSwears(swearJarId string, userId string) ([]Swear, error) {
	if isOwner, err := s.IsOwner(swearJarId, userId); err != nil {
		return nil, err
	} else if !isOwner {
		log.Printf("User ID: %s is not an owner of SwearJar ID: %s", userId, swearJarId)
		return nil, authentication.ErrUnauthorized
	}

	maxSwearsToFetch := 5
	swears, err := s.r.GetSwears(swearJarId, maxSwearsToFetch)
	if err != nil {
		return nil, err
	}

	return swears, nil
}

func (s *service) GetSwearJarsByUserId(userId string) ([]SwearJar, error) {
	return s.r.GetSwearJarsByUserId(userId)
}

func (s *service) GetSwearJarById(swearJarId string, userId string) (SwearJar, error) {
	if isOwner, err := s.IsOwner(swearJarId, userId); err != nil {
		return SwearJar{}, err
	} else if !isOwner {
		log.Printf("User ID: %s is not an owner of SwearJar ID: %s", userId, swearJarId)
		return SwearJar{}, authentication.ErrUnauthorized
	}

	swearJar, err := s.r.GetSwearJarById(swearJarId)
	if err != nil {
		return SwearJar{}, err
	}

	return swearJar, nil
}

func (s *service) SwearJarTrend(swearJarId string, userId string, period string) (SwearJar, error) {
	if period != "days" && period != "weeks" && period != "months" {
		return SwearJar{}, errors.New("invalid period")
	}

	return SwearJar{}, nil
}
