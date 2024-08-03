package swearJar

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Swear struct {
	ObjectID   primitive.ObjectID `bson:"_id,omitempty"`
	UserID     primitive.ObjectID `bson:"user_id"`
	DateTime   time.Time          `bson:"swear_time"`
	Active     bool               `bson:"active"`
	swearJarId primitive.ObjectID `bson:"swear_jar_id"`
}
