package swearJar

import (
	"errors"
	"log"
	"slices"

	"github.com/mikeytheong/swearjar/backend/pkg/authentication"
)

type Service interface {
	AddSwear(Swear) error
	CreateSwearJar(Name string, Desc string, Owners []string) (SwearJarBase, error)
	UpdateSwearJar(sj SwearJarBase, userId string) error
	GetSwearJarById(swearJarId string, userId string) (SwearJarWithOwners, error)
	GetSwearJarsByUserId(userId string) ([]SwearJarBase, error)
	GetSwearsWithUsers(swearJarId string, userId string) (RecentSwearsWithUsers, error)
	SwearJarTrend(swearJarId string, userId string, period string) ([]ChartData, error)
}

type Repository interface {
	AddSwear(Swear) error
	CreateSwearJar(SwearJarBase) (SwearJarBase, error)
	UpdateSwearJar(SwearJarBase) error
	GetSwearJarById(swearJarId string) (SwearJarWithOwners, error)
	GetSwearJarOwners(swearJarId string) (owners []string, err error)
	GetSwearJarsByUserId(swearJarId string) ([]SwearJarBase, error)
	GetSwearsWithUsers(swearJarId string, limit int) (RecentSwearsWithUsers, error)
	SwearJarTrend(swearJarId string, period string, numOfDataPoints int) ([]ChartData, error)
}

type service struct {
	r Repository
}

// NewService creates an adding service with the necessary dependencies
func NewService(r Repository) Service {
	return &service{r}
}

func (s *service) CreateSwearJar(Name string, Desc string, Owners []string) (SwearJarBase, error) {
	sj := SwearJarBase{
		Name:   Name,
		Desc:   Desc,
		Owners: Owners,
	}

	return s.r.CreateSwearJar(sj)
}
func (s *service) UpdateSwearJar(sj SwearJarBase, userId string) error {
	isOwner, err := s.IsOwner(sj.SwearJarId, userId)
	if err != nil {
		return err
	}
	if !isOwner {
		return errors.New("user is not an owner of this SwearJar")
	}

	if slices.Contains(sj.Owners, userId) {
		return s.r.UpdateSwearJar(sj)
	}
	return errors.New("User making the request cannot be removed as an owner")
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

func (s *service) GetSwearsWithUsers(swearJarId string, userId string) (RecentSwearsWithUsers, error) {
	if isOwner, err := s.IsOwner(swearJarId, userId); err != nil {
		return RecentSwearsWithUsers{}, err
	} else if !isOwner {
		log.Printf("User ID: %s is not an owner of SwearJar ID: %s", userId, swearJarId)
		return RecentSwearsWithUsers{}, authentication.ErrUnauthorized
	}

	maxSwearsToFetch := 5
	data, err := s.r.GetSwearsWithUsers(swearJarId, maxSwearsToFetch)
	if err != nil {
		return RecentSwearsWithUsers{}, err
	}

	return RecentSwearsWithUsers{Swears: data.Swears, Users: data.Users}, nil
}

func (s *service) GetSwearJarsByUserId(userId string) ([]SwearJarBase, error) {
	return s.r.GetSwearJarsByUserId(userId)
}

func (s *service) GetSwearJarById(swearJarId string, userId string) (SwearJarWithOwners, error) {
	if isOwner, err := s.IsOwner(swearJarId, userId); err != nil {
		return SwearJarWithOwners{}, err
	} else if !isOwner {
		log.Printf("User ID: %s is not an owner of SwearJar ID: %s", userId, swearJarId)
		return SwearJarWithOwners{}, authentication.ErrUnauthorized
	}

	swearJar, err := s.r.GetSwearJarById(swearJarId)
	if err != nil {
		return SwearJarWithOwners{}, err
	}

	return swearJar, nil
}

func (s *service) SwearJarTrend(swearJarId string, userId string, period string) ([]ChartData, error) {
	numOfDataPoints := 6
	if period != "days" && period != "weeks" && period != "months" {
		return []ChartData{}, errors.New("invalid period")
	}

	if isOwner, err := s.IsOwner(swearJarId, userId); err != nil {
		return []ChartData{}, err
	} else if !isOwner {
		log.Printf("User ID: %s is not an owner of SwearJar ID: %s", userId, swearJarId)
		return []ChartData{}, authentication.ErrUnauthorized
	}

	chartData, err := s.r.SwearJarTrend(swearJarId, period, numOfDataPoints)
	if err != nil {
		return []ChartData{}, err
	}

	return chartData, nil
}
