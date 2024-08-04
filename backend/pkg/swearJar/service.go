package swearJar

import (
	"fmt"
)

type Service interface {
	CreateSwearJar(SwearJar) error
	AddSwear(Swear) error
	// TODO: GetSwears() []Swear
}

type Repository interface {
	CreateSwearJar(SwearJar) error
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

func (s *service) CreateSwearJar(sj SwearJar) error {
	return s.r.CreateSwearJar(sj)
}

func (s *service) AddSwear(swear Swear) error {
	// Fetch the owners of the SwearJar
	owners, err := s.r.GetSwearJarOwners(swear.SwearJarId)
	if err != nil {
		return err
	}

	// Check if UserID is an owner of the SwearJar
	isOwner := false
	for _, ownerID := range owners {
		if ownerID == swear.UserID {
			isOwner = true
			break
		}
	}
	if !isOwner {
		return fmt.Errorf("User ID: %s is not an owner of SwearJar ID: %s", swear.UserID, swear.SwearJarId)
	}

	return s.r.AddSwear(swear)
}
