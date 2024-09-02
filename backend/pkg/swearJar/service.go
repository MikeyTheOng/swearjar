package swearJar

import (
	"fmt"
	"time"
)

type Service interface {
	GetSwearJarsByUserId(userId string) ([]SwearJar, error)
	CreateSwearJar(Name string, Desc string, Owners []string) (SwearJar, error)
	AddSwear(Swear) error
	// TODO: GetSwears() []Swear
}

type Repository interface {
	GetSwearJarsByUserId(swearJarId string) ([]SwearJar, error)
	CreateSwearJar(SwearJar) (SwearJar, error)
	AddSwear(Swear) error
	GetSwearJarOwners(swearJarId string) (owners []string, err error)
	// TODO: GetSwears() []Swear
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
		return fmt.Errorf("User ID: %s is not an owner of SwearJar ID: %s", swear.UserId, swear.SwearJarId)
	}

	return s.r.AddSwear(swear)
}

func (s *service) GetSwearJarsByUserId(userId string) ([]SwearJar, error) {
	return s.r.GetSwearJarsByUserId(userId)
}
