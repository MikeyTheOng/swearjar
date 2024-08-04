package swearJar

import (
	"time"
)

type SwearJar struct {
	Name      string
	Desc      string
	Owners    []string
	CreatedAt time.Time
}
