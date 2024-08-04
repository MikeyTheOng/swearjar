package swearJar

import (
	"time"
)

type Swear struct {
	UserId     string
	DateTime   time.Time
	Active     bool
	SwearJarId string
}
