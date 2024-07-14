package authentication

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ObjectID primitive.ObjectID `bson:"_id,omitempty"`
	Name     string             `bson:"name"`
	Password string             `bson:"password"`
	Email    string             `bson:"email"`
}
