package swearJar

import (
	"time"

	"github.com/mikeytheong/swearjar/backend/pkg/authentication"
)

type SwearJarBase struct {
	SwearJarId string    `bson:"_id,omitempty"`
	Name       string    `bson:"Name"`
	Desc       string    `bson:"Desc"`
	Owners     []string  `bson:"Owners"`
	CreatedAt  time.Time `bson:"CreatedAt"`
}

type SwearJarWithOwners struct {
    SwearJarId string    `bson:"_id,omitempty"`
    Name       string    `bson:"Name"`
	Desc       string    `bson:"Desc,omitempty"`
	Owners     []authentication.UserResponse    `bson:"Owners"`
	CreatedAt  time.Time `bson:"CreatedAt"`
}