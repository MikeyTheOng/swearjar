package swearJar

import (
	"time"
)

type SwearJar struct {
	SwearJarId string    `bson:"_id,omitempty"`
	Name       string    `bson:"Name"`
	Desc       string    `bson:"Desc"`
	Owners     []string  `bson:"Owners"`
	CreatedAt  time.Time `bson:"CreatedAt"`
}
