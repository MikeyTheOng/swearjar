package swearJar

import (
	"time"
)

type Swear struct {
	UserID     string `bson:"user_id"`
	DateTime   time.Time          `bson:"date_time"`
	Active     bool               `bson:"active"`
	SwearJarId string `bson:"swear_jar_id"`
}
