package swearJar

import (
	"time"
)

type Swear struct {
	UserId      string
	CreatedAt   time.Time
	Active      bool
	SwearJarId  string
	SwearDescription string
}
