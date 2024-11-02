package swearJar

import (
	"time"

	"github.com/mikeytheong/swearjar/backend/pkg/authentication"
)

type SwearJarBase struct {
	SwearJarId    string    `bson:"_id,omitempty"`
	Name          string    `bson:"Name"`
	Desc          string    `bson:"Desc"`
	Owners        []string  `bson:"Owners"`
	CreatedAt     time.Time `bson:"CreatedAt"`
	CreatedBy     string    `bson:"CreatedBy"`
	LastUpdatedAt time.Time `bson:"LastUpdatedAt"`
	LastUpdatedBy string    `bson:"LastUpdatedBy"`
}

type SwearJarWithOwners struct {
	SwearJarId    string                        `bson:"_id,omitempty"`
	Name          string                        `bson:"Name"`
	Desc          string                        `bson:"Desc,omitempty"`
	Owners        []authentication.UserResponse `bson:"Owners"`
	CreatedAt     time.Time                     `bson:"CreatedAt"`
	CreatedBy     authentication.UserResponse   `bson:"CreatedBy"`
	LastUpdatedAt time.Time                     `bson:"LastUpdatedAt"`
	LastUpdatedBy authentication.UserResponse   `bson:"LastUpdatedBy"`
}

type SwearJarStats struct {
	ActiveSwears int `bson:"ActiveSwears"`
}
