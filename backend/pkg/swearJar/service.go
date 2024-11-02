package swearJar

import (
	"errors"
	"log"
	"slices"
	"time"

	"github.com/mikeytheong/swearjar/backend/pkg/authentication"
)

type Service interface {
	AddSwear(s Swear, userId string) error
	CreateSwearJar(Name string, Desc string, Owners []string, userId string) (SwearJarBase, error)
	UpdateSwearJar(sj SwearJarBase, userId string) error
	GetSwearJarById(swearJarId string, userId string) (SwearJarWithOwners, error)
	GetSwearJarsByUserId(userId string) ([]SwearJarWithOwners, error)
	GetSwearsWithUsers(swearJarId string, userId string) (RecentSwearsWithUsers, error)
	SwearJarStats(swearJarId string, userId string) (SwearJarStats, error)
	SwearJarTrend(swearJarId string, userId string, period string) ([]ChartData, error)
	ClearSwearJar(swearJarId string, userId string) error
}

type Repository interface {
	AddSwear(Swear) error
	CreateSwearJar(SwearJarBase) (SwearJarBase, error)
	UpdateSwearJar(SwearJarBase) error
	GetSwearJarById(swearJarId string) (SwearJarWithOwners, error)
	GetSwearJarOwners(swearJarId string) (owners []string, err error)
	GetSwearJarsByUserId(userId string) ([]SwearJarWithOwners, error)
	GetSwearsWithUsers(swearJarId string, limit int) (RecentSwearsWithUsers, error)
	SwearJarStats(swearJarId string) (SwearJarStats, error)
	SwearJarTrend(swearJarId string, period string, numOfDataPoints int) ([]ChartData, error)
	ClearSwearJar(swearJarId string, userId string) error
}

type service struct {
	r Repository
}

// NewService creates an adding service with the necessary dependencies
func NewService(r Repository) Service {
	return &service{r}
}

func (s *service) CreateSwearJar(Name string, Desc string, Owners []string, userId string) (SwearJarBase, error) {
	if len(Owners) == 0 {
		return SwearJarBase{}, errors.New("at least one owner is required")
	}

	now := time.Now()
	sj := SwearJarBase{
		Name:          Name,
		Desc:          Desc,
		Owners:        Owners,
		CreatedAt:     now,
		CreatedBy:     userId,
		LastUpdatedAt: now,
		LastUpdatedBy: userId,
	}

	return s.r.CreateSwearJar(sj)
}

func (s *service) UpdateSwearJar(sj SwearJarBase, userId string) error {
	// Check if user is an existing owner of the SwearJar
	isOwner, err := s.IsOwner(sj.SwearJarId, userId)
	if err != nil {
		return err
	}
	if !isOwner {
		return errors.New("user is not an owner of this SwearJar")
	}

	// User cannot remove themselves as an owner
	if !slices.Contains(sj.Owners, userId) {
		return errors.New("User making the request cannot be removed as an owner")
	}

	sj.LastUpdatedAt = time.Now()
	sj.LastUpdatedBy = userId
	return s.r.UpdateSwearJar(sj)
}

func (s *service) AddSwear(swear Swear, userId string) error {
	if isOwner, err := s.IsOwner(swear.SwearJarId, userId); err != nil {
		return err
	} else if !isOwner {
		log.Printf("User ID: %s is not an owner of SwearJar ID: %s", userId, swear.SwearJarId)
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

func (s *service) GetSwearJarsByUserId(userId string) ([]SwearJarWithOwners, error) {
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

func (s *service) SwearJarStats(swearJarId string, userId string) (SwearJarStats, error) {
	if isOwner, err := s.IsOwner(swearJarId, userId); err != nil {
		return SwearJarStats{}, err
	} else if !isOwner {
		log.Printf("User ID: %s is not an owner of SwearJar ID: %s", userId, swearJarId)
		return SwearJarStats{}, authentication.ErrUnauthorized
	}

	stats, err := s.r.SwearJarStats(swearJarId)
	if err != nil {
		return SwearJarStats{}, err
	}

	return stats, nil
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

func (s *service) ClearSwearJar(swearJarId string, userId string) error {
	isOwner, err := s.IsOwner(swearJarId, userId)
	if err != nil {
		return err
	}
	if !isOwner {
		log.Printf("User ID: %s is not an owner of SwearJar ID: %s", userId, swearJarId)
		return authentication.ErrUnauthorized
	}

	return s.r.ClearSwearJar(swearJarId, userId)
}
