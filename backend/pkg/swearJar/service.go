package swearJar

import (
	"fmt"
	"log"
	"time"

	"github.com/mikeytheong/swearjar/backend/pkg/authentication"
)

type Service interface {
	GetSwearJarsByUserId(userId string) ([]SwearJar, error)
	GetSwearJarById(swearJarId string, userId string) (SwearJar, error)
	CreateSwearJar(Name string, Desc string, Owners []string) (SwearJar, error)
	AddSwear(Swear) error
	GetSwears(swearJarId string, userId string) ([]Swear, error)
}

type Repository interface {
	GetSwearJarsByUserId(swearJarId string) ([]SwearJar, error)
	GetSwearJarById(swearJarId string) (SwearJar, error)
	CreateSwearJar(SwearJar) (SwearJar, error)
	GetSwearJarOwners(swearJarId string) (owners []string, err error)
	AddSwear(Swear) error
	GetSwears(swearJarId string, userId string, limit int) ([]Swear, error)
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
	// Fetch the owners of the SwearJar
	owners, err := s.r.GetSwearJarOwners(swear.SwearJarId)
	if err != nil {
		return err
	}

	// Check if UserId is an owner of the SwearJar
	isOwner := false
	for _, ownerID := range owners {
		if ownerID == swear.UserId {
			isOwner = true
			break
		}
	}
	if !isOwner {
		log.Printf("User ID: %s is not an owner of SwearJar ID: %s", swear.UserId, swear.SwearJarId)
		return authentication.ErrUnauthorized
	}

	return s.r.AddSwear(swear)
}

func (s *service) GetSwears(swearJarId string, userId string) ([]Swear, error) {
	maxSwearsToFetch := 5
	swears, err := s.r.GetSwears(swearJarId, userId, maxSwearsToFetch)
	if err != nil {
		return nil, err
	}

	return swears, nil
}

func (s *service) GetSwearJarsByUserId(userId string) ([]SwearJar, error) {
	return s.r.GetSwearJarsByUserId(userId)
}

func (s *service) GetSwearJarById(swearJarId string, userId string) (SwearJar, error) {
	swearJar, err := s.r.GetSwearJarById(swearJarId)
	if err != nil {
		return SwearJar{}, err
	}

	// Only allow the user to access the SwearJar if they are an owner
	isOwner := false
	for _, ownerID := range swearJar.Owners {
		if ownerID == userId {
			isOwner = true
			break
		}
	}
	if !isOwner {
		return SwearJar{}, fmt.Errorf("User ID: %s is not an owner of SwearJar ID: %s", userId, swearJarId)
	}

	return swearJar, nil
}
