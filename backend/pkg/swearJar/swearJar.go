package swearJar

import "go.mongodb.org/mongo-driver/bson/primitive"

type SwearJar struct {
	ObjectID primitive.ObjectID   `bson:"_id,omitempty"`
	Name     string               `bson:"name"`
	Desc     string               `bson:"desc"`
	Owners   []primitive.ObjectID `bson:"owners"`
}
