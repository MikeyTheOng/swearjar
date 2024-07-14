package swearJar

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
	"time"
)

type Swear struct {
	ObjectID primitive.ObjectID `bson:"_id,omitempty"`
	UserID   primitive.ObjectID `bson:"user_id"`
	DateTime time.Time          `bson:"swear_time"`
	Active   bool               `bson:"active"`
}
