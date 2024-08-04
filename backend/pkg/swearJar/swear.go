package swearJar

import (
	"time"
)

type Swear struct {
	UserID     string
	DateTime   time.Time
	Active     bool
	SwearJarId string
}
