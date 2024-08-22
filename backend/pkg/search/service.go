package search

import (
	"sort"

	"github.com/agnivade/levenshtein"
	"github.com/mikeytheong/swearjar/backend/pkg/authentication"
)

type Service interface {
	GetTopClosestEmails(query string, currentUserId string) ([]authentication.UserResponse, error)
}

type Repository interface {
	FindUsersByEmailPattern(query string, maxNumResults int, currentUserId string) ([]authentication.UserResponse, error)
}

type service struct {
	r Repository
}

func NewService(r Repository) Service {
	return &service{r}
}

func (s *service) GetTopClosestEmails(query string, currentUserId string) ([]authentication.UserResponse, error) {
	// Retrieve the users that match the regex pattern
	maxNumResults := 5
	users, err := s.r.FindUsersByEmailPattern(query, maxNumResults, currentUserId)
	if err != nil {
		return nil, err
	}

	// Sort the results based on Levenshtein distance
	sort.Slice(users, func(i, j int) bool {
		return levenshtein.ComputeDistance(query, users[i].Email) < levenshtein.ComputeDistance(query, users[j].Email)
	})

	return users, nil
}
