package swearJar

import "github.com/mikeytheong/swearjar/backend/pkg/authentication"

type RecentSwearsWithUsers struct {
	Swears []Swear
	Users  map[string]authentication.UserResponse
}
