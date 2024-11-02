package mongodb

import (
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

func GetSwearJarsPipeline(matchStage bson.M) mongo.Pipeline {
	return mongo.Pipeline{
		{primitive.E{Key: "$match", Value: matchStage}},
		{primitive.E{Key: "$lookup", Value: bson.M{
			"from":         "users",
			"localField":   "Owners",
			"foreignField": "_id",
			"as":           "Owners",
		}}},
		{primitive.E{Key: "$lookup", Value: bson.M{
			"from":         "users",
			"localField":   "CreatedBy",
			"foreignField": "_id",
			"as":           "CreatedByUser",
		}}},
		{primitive.E{Key: "$lookup", Value: bson.M{
			"from":         "users",
			"localField":   "LastUpdatedBy",
			"foreignField": "_id",
			"as":           "LastUpdatedByUser",
		}}},
		{primitive.E{Key: "$project", Value: bson.M{
			"_id":       1,
			"Name":      1,
			"Desc":      1,
			"CreatedAt": 1,
			"CreatedBy": bson.M{
				"$arrayElemAt": bson.A{"$CreatedByUser", 0},
			},
			"LastUpdatedAt": 1,
			"LastUpdatedBy": bson.M{
				"$arrayElemAt": bson.A{"$LastUpdatedByUser", 0},
			},
			"Owners": bson.M{
				"$map": bson.M{
					"input": "$Owners",
					"as":    "owner",
					"in": bson.M{
						"_id":      "$$owner._id",
						"Email":    "$$owner.Email",
						"Name":     "$$owner.Name",
						"Verified": "$$owner.Verified",
					},
				},
			},
		}}},
		{primitive.E{Key: "$project", Value: bson.M{
			"_id":       1,
			"Name":      1,
			"Desc":      1,
			"CreatedAt": 1,
			"CreatedBy": bson.M{
				"_id":      "$CreatedBy._id",
				"Email":    "$CreatedBy.Email",
				"Name":     "$CreatedBy.Name",
				"Verified": "$CreatedBy.Verified",
			},
			"LastUpdatedAt": 1,
			"LastUpdatedBy": bson.M{
				"_id":      "$LastUpdatedBy._id",
				"Email":    "$LastUpdatedBy.Email",
				"Name":     "$LastUpdatedBy.Name",
				"Verified": "$LastUpdatedBy.Verified",
			},
			"Owners": 1,
		}}},
	}
}
