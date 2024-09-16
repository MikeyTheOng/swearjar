package mongodb

// import (
// 	"time"

// 	"go.mongodb.org/mongo-driver/bson/primitive"
// )

// type Swear struct {
// 	ObjectID   primitive.ObjectID `bson:"_id,omitempty"`
// 	UserId     primitive.ObjectID `bson:"user_id"`
// 	CreatedAt  time.Time          `bson:"created_at"`
// 	Active     bool               `bson:"active"`
// 	SwearJarId primitive.ObjectID `bson:"swear_jar_id"`
// }

// type SwearJar struct {
// 	ObjectID primitive.ObjectID   `bson:"_id,omitempty"`
// 	Name     string               `bson:"name"`
// 	Desc     string               `bson:"desc"`
// 	Owners   []primitive.ObjectID `bson:"owners"`
// }

// type User struct {
// 	ObjectID primitive.ObjectID `bson:"_id,omitempty"`
// 	Name     string             `bson:"name"`
// 	Password string             `bson:"password"`
// 	Email    string             `bson:"email"`
// }

type UserResponse struct {
	UserId string `bson:"_id"`
	Email  string `bson:"Email"`
	Name   string `bson:"Name"`
}
