package mongodb

import (
	"context"
	"fmt"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// ConvertStringIDsToObjectIDs converts a slice of string IDs to a slice of primitive.ObjectID
func ConvertStringIDsToObjectIDs(stringIDs []string) ([]primitive.ObjectID, error) {
	objectIDs := make([]primitive.ObjectID, len(stringIDs))
	for i, stringID := range stringIDs {
		oid, err := primitive.ObjectIDFromHex(stringID)
		if err != nil {
			return nil, fmt.Errorf("invalid ID at index %d: %s", i, stringID)
		}
		objectIDs[i] = oid
	}
	return objectIDs, nil
}

func (r *MongoRepository) AreUserIDsValid(userIDs []primitive.ObjectID) error {
	for _, userID := range userIDs {
		count, err := r.users.CountDocuments(context.TODO(), bson.M{"_id": userID})
		if err != nil {
			return fmt.Errorf("error checking user ID: %w", err)
		}
		if count == 0 {
			return fmt.Errorf("invalid user ID: %s", userID.Hex())
		}
	}
	return nil
}
