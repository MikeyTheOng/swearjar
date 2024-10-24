package mongodb

import (
	"context"
	"errors"
	"fmt"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/mikeytheong/swearjar/backend/pkg/authentication"
	"github.com/mikeytheong/swearjar/backend/pkg/swearJar"
)

type MongoRepository struct {
	client     *mongo.Client
	db         *mongo.Database
	swearJars  *mongo.Collection
	swears     *mongo.Collection
	users      *mongo.Collection
	authTokens *mongo.Collection
}

func NewMongoRepository() *MongoRepository {
	client := ConnectToDB()
	db := client.Database(os.Getenv("DB_NAME"))
	swearJars := db.Collection(os.Getenv("DB_COLLECTION_SWEARJARS"))
	swears := db.Collection(os.Getenv("DB_COLLECTION_SWEARJAR"))
	users := db.Collection(os.Getenv("DB_COLLECTION_USERS"))
	authTokens := db.Collection(os.Getenv("DB_COLLECTION_AUTH_TOKENS"))
	return &MongoRepository{client, db, swearJars, swears, users, authTokens}
}

func ConnectToDB() *mongo.Client {
	username, password, clusterURL := os.Getenv("DB_USERNAME"), os.Getenv("DB_PASSWORD"), os.Getenv("DB_CLUSTER_URL")
	connectionString := fmt.Sprintf("mongodb+srv://%s:%s@%s", username, password, clusterURL)
	clientOptions := options.Client().ApplyURI(connectionString)

	client, err := mongo.Connect(context.TODO(), clientOptions)

	if err != nil {
		log.Fatal(err)
	}

	err = client.Ping(context.TODO(), nil) // Check the connection

	if err != nil {
		log.Fatal(err)
	}

	return client
}

func (r *MongoRepository) GetSwearJarsByUserId(userId string) ([]swearJar.SwearJarBase, error) {
	userIdHex, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		return nil, fmt.Errorf("invalid UserId: %v", err)
	}

	filter := bson.M{"Owners": userIdHex}
	cursor, err := r.swearJars.Find(context.TODO(), filter)
	if err != nil {
		log.Printf("Error fetching swear jars by user ID: %v", err)
		return nil, err
	}
	defer cursor.Close(context.TODO())

	var swearJars []swearJar.SwearJarBase
	for cursor.Next(context.TODO()) {
		var sj swearJar.SwearJarBase
		if err := cursor.Decode(&sj); err != nil {
			log.Printf("Error decoding swear jar: %v", err)
			return nil, err
		}
		swearJars = append(swearJars, sj)
	}

	if err := cursor.Err(); err != nil {
		return nil, err
	}

	return swearJars, nil
}

func (r *MongoRepository) GetSwearJarById(swearJarId string) (swearJar.SwearJarWithOwners, error) {
	swearJarIdHex, err := primitive.ObjectIDFromHex(swearJarId)
	if err != nil {
		return swearJar.SwearJarWithOwners{}, fmt.Errorf("invalid SwearJarId: %v", err)
	}

	pipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.M{"_id": swearJarIdHex}}},
		{{Key: "$lookup", Value: bson.M{
			"from":         "users",
			"localField":   "Owners",
			"foreignField": "_id",
			"as":           "Owners",
		}}},
		{{Key: "$project", Value: bson.M{
			"_id":       1,
			"Name":      1,
			"Desc":      1,
			"CreatedAt": 1,
			"Owners": bson.M{
				"$map": bson.M{
					"input": "$Owners",
					"as":    "owner",
					"in": bson.M{
						"_id":   "$$owner._id",
						"Email": "$$owner.Email",
						"Name":  "$$owner.Name",
					},
				},
			},
		}}},
	}

	cursor, err := r.swearJars.Aggregate(context.TODO(), pipeline)
	if err != nil {
		return swearJar.SwearJarWithOwners{}, fmt.Errorf("error executing aggregation: %v", err)
	}
	defer cursor.Close(context.TODO())

	var results []swearJar.SwearJarWithOwners
	if err = cursor.All(context.TODO(), &results); err != nil {
		return swearJar.SwearJarWithOwners{}, fmt.Errorf("error decoding aggregation results: %v", err)
	}

	if len(results) == 0 {
		return swearJar.SwearJarWithOwners{}, fmt.Errorf("swear jar not found")
	}

	return results[0], nil
}

func (r *MongoRepository) CreateSwearJar(sj swearJar.SwearJarBase) (swearJar.SwearJarBase, error) {
	ownerIDs, err := ConvertStringIDsToObjectIDs(sj.Owners)
	if err != nil {
		return swearJar.SwearJarBase{}, fmt.Errorf("failed to convert owner IDs: %w", err)
	}

	// Check if all userIds in Owners field are valid users
	if err := r.AreUserIDsValid(ownerIDs); err != nil {
		return swearJar.SwearJarBase{}, err
	}

	result, err := r.swearJars.InsertOne(
		context.TODO(),
		bson.D{
			{Key: "Name", Value: sj.Name},
			{Key: "Desc", Value: sj.Desc},
			{Key: "Owners", Value: ownerIDs},
			{Key: "CreatedAt", Value: time.Now()},
		},
	)
	if err != nil {
		return swearJar.SwearJarBase{}, err
	}

	// Get the inserted document
	insertedID := result.InsertedID.(primitive.ObjectID)
	filter := bson.M{"_id": insertedID}
	var createdSwearJar swearJar.SwearJarBase
	err = r.swearJars.FindOne(context.TODO(), filter).Decode(&createdSwearJar)
	if err != nil {
		return swearJar.SwearJarBase{}, err
	}

	return createdSwearJar, nil
}

func (r *MongoRepository) UpdateSwearJar(sj swearJar.SwearJarBase) error {
	swearJarIdHex, err := primitive.ObjectIDFromHex(sj.SwearJarId)
	if err != nil {
		return fmt.Errorf("invalid SwearJarId: %v", err)
	}

	ownerIDs, err := ConvertStringIDsToObjectIDs(sj.Owners)
	if err != nil {
		return fmt.Errorf("failed to convert owner IDs: %w", err)
	}

	if err := r.AreUserIDsValid(ownerIDs); err != nil {
		return err
	}

	update := bson.M{"$set": bson.M{
		"Name":   sj.Name,
		"Desc":   sj.Desc,
		"Owners": ownerIDs,
	}}

	result, err := r.swearJars.UpdateByID(context.TODO(), swearJarIdHex, update)
	if err != nil {
		return fmt.Errorf("Error updating Swear Jar: %v", err)
	}
	if result.MatchedCount == 0 {
		return fmt.Errorf("Swear Jar does not exist")
	}

	return nil
}

func (r *MongoRepository) GetSwearJarOwners(swearJarId string) (owners []string, err error) {
	type SwearJarOwners struct {
		Owners []primitive.ObjectID `bson:"Owners"`
	}

	swearJarIdHex, err := primitive.ObjectIDFromHex(swearJarId)
	var result SwearJarOwners
	err = r.swearJars.FindOne(
		context.TODO(),
		bson.M{"_id": swearJarIdHex},
		options.FindOne().SetProjection(bson.M{"Owners": 1}),
	).Decode(&result)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, fmt.Errorf("invalid SwearJar ID: %s", swearJarId)
		}
		return nil, err
	}

	for _, ownerId := range result.Owners {
		owners = append(owners, ownerId.Hex())
	}

	return owners, nil
}

func (r *MongoRepository) SwearJarTrend(swearJarId string, period string, numOfDataPoints int) ([]swearJar.ChartData, error) {
	swearJarIdHex, err := primitive.ObjectIDFromHex(swearJarId)
	if err != nil {
		return nil, fmt.Errorf("invalid SwearJarId: %v", err)
	}
	var results []swearJar.ChartData

	var startDate time.Time
	switch period {
	case "days":
		startDate = time.Now().UTC().AddDate(0, 0, -numOfDataPoints).Truncate(24 * time.Hour)
	case "weeks":
		startDate = time.Now().UTC().AddDate(0, 0, -numOfDataPoints*7).Truncate(24 * time.Hour)
	case "months":
		startDate = time.Now().UTC().AddDate(-numOfDataPoints, 0, 0).Truncate(24 * time.Hour)
	default:
		return nil, fmt.Errorf("invalid period: %s", period)
	}

	pipeline := SwearJarTrendPipeline(period, numOfDataPoints, startDate, swearJarIdHex)

	cursor, err := r.swearJars.Aggregate(context.TODO(), pipeline)
	if err != nil {
		return nil, fmt.Errorf("error aggregating swears: %v", err)
	}
	defer cursor.Close(context.TODO())

	if err := cursor.All(context.TODO(), &results); err != nil {
		return nil, fmt.Errorf("error decoding aggregation results: %v", err)
	}

	return results, nil
}

func (r *MongoRepository) AddSwear(s swearJar.Swear) error {
	userIdHex, err := primitive.ObjectIDFromHex(s.UserId)
	if err != nil {
		return fmt.Errorf("invalid UserId: %v", err)
	}

	swearJarIdHex, err := primitive.ObjectIDFromHex(s.SwearJarId)
	if err != nil {
		return fmt.Errorf("invalid SwearJarId: %v", err)
	}

	_, err = r.swears.InsertOne(
		context.TODO(),
		bson.D{
			{Key: "CreatedAt", Value: s.CreatedAt},
			{Key: "Active", Value: s.Active},
			{Key: "UserId", Value: userIdHex},
			{Key: "SwearJarId", Value: swearJarIdHex},
			{Key: "SwearDescription", Value: s.SwearDescription},
		},
	)

	// Debugging
	// const layout = "Jan 2, 2006 at 3:04pm (MST)"
	// fmt.Printf("Added Swear{CreatedAt: %v, Active: %v, UserId: %V}\n", s.CreatedAt.Format(layout), s.Active, s.UserId.Hex())
	return err
}

func (r *MongoRepository) GetSwearsWithUsers(swearJarId string, limit int) (swearJar.RecentSwearsWithUsers, error) {
	swearJarIdHex, err := primitive.ObjectIDFromHex(swearJarId)
	if err != nil {
		return swearJar.RecentSwearsWithUsers{}, fmt.Errorf("invalid SwearJarId: %v", err)
	}

	filter := bson.M{"SwearJarId": swearJarIdHex, "Active": true}
	findOptions := options.Find().SetSort(bson.D{{Key: "CreatedAt", Value: -1}}).SetLimit(int64(limit))
	cursor, err := r.swears.Find(context.TODO(), filter, findOptions)
	if err != nil {
		return swearJar.RecentSwearsWithUsers{}, err
	}
	defer cursor.Close(context.TODO())

	var swears []swearJar.Swear
	if err := cursor.All(context.TODO(), &swears); err != nil {
		return swearJar.RecentSwearsWithUsers{}, err
	}

	var usersMap = make(map[string]authentication.UserResponse)
	for _, s := range swears {
		user, err := r.GetUserById(s.UserId)
		if err != nil {
			return swearJar.RecentSwearsWithUsers{}, err
		}
		usersMap[s.UserId] = user
	}

	return swearJar.RecentSwearsWithUsers{Swears: swears, Users: usersMap}, nil
}

func (r *MongoRepository) SignUp(u authentication.User) error {
	_, err := r.users.InsertOne(
		context.TODO(),
		bson.D{
			{Key: "Email", Value: u.Email},
			{Key: "Name", Value: u.Name},
			{Key: "Password", Value: u.Password},
		},
	)
	return err
}

func (r *MongoRepository) CreateAuthToken(authToken authentication.AuthToken) error {
	_, err := r.authTokens.InsertOne(context.TODO(), bson.D{
		{Key: "Email", Value: authToken.Email},
		{Key: "Token", Value: authToken.Token},
		{Key: "CreatedAt", Value: authToken.CreatedAt},
		{Key: "ExpiresAt", Value: authToken.ExpiresAt},
		{Key: "Purpose", Value: authToken.Purpose},
		{Key: "Used", Value: authToken.Used},
	})
	return err
}

func (r *MongoRepository) GetUserByEmail(e string) (authentication.User, error) {
	filter := bson.D{{Key: "Email", Value: e}}
	var result struct {
		UserId   primitive.ObjectID `bson:"_id"`
		Email    string             `bson:"Email"`
		Name     string             `bson:"Name"`
		Password string             `bson:"Password"`
	}
	var user authentication.User

	err := r.users.FindOne(context.TODO(), filter).Decode(&result)
	if err != nil {
		log.Printf("Error fetching user by email {%v}: %v", e, err)
		if errors.Is(err, mongo.ErrNoDocuments) {
			return user, authentication.ErrNoDocuments
		}
		return user, err
	}

	user = authentication.User{
		UserId:   result.UserId.Hex(), // Convert ObjectId to string
		Email:    result.Email,
		Name:     result.Name,
		Password: result.Password,
	}

	return user, nil
}

func (r *MongoRepository) GetUserById(userId string) (authentication.UserResponse, error) {
	userIdHex, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		return authentication.UserResponse{}, fmt.Errorf("invalid UserId: %v", err)
	}

	var result authentication.UserResponse
	filter := bson.M{"_id": userIdHex}
	err = r.users.FindOne(context.TODO(), filter).Decode(&result)
	if err != nil {
		return authentication.UserResponse{}, err
	}

	return result, nil
}

func (r *MongoRepository) FindUsersByEmailPattern(query string, maxNumResults int, currentUserId string) ([]authentication.UserResponse, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Convert currentUserId from string to ObjectId
	currentUserObjectId, err := primitive.ObjectIDFromHex(currentUserId)
	if err != nil {
		log.Printf("Invalid UserId: %v", err)
		return nil, err
	}

	// Use a regular expression to match emails that contain similar patterns and exclude the current user
	filter := bson.M{
		"Email": bson.M{
			"$regex":   ".*" + query + ".*",
			"$options": "i", // Case-insensitive search
		},
		"_id": bson.M{
			"$ne": currentUserObjectId, // Exclude the current user
		},
	}

	// Define options to retrieve only the top results
	findOptions := options.Find().SetLimit(int64(maxNumResults))

	// Perform the search
	cursor, err := r.users.Find(ctx, filter, findOptions)
	if err != nil {
		log.Printf("Error finding similar emails: %v", err)
		return nil, err
	}
	defer cursor.Close(ctx)

	var decodedUsers []authentication.UserResponse

	for cursor.Next(ctx) {
		var mongoUR UserResponse
		err := cursor.Decode(&mongoUR)
		if err != nil {
			log.Printf("Error decoding user response: %v", err)
			return nil, err
		}

		// Convert MongoDB UserResponse to authentication.UserResponse
		authUR := authentication.UserResponse{
			UserId: mongoUR.UserId,
			Email:  mongoUR.Email,
			Name:   mongoUR.Name,
		}

		decodedUsers = append(decodedUsers, authUR)
	}

	if err := cursor.Err(); err != nil {
		log.Printf("Cursor error: %v", err)
		return nil, err
	}

	return decodedUsers, nil
}

func (r *MongoRepository) GetAuthToken(hashedToken string) (authentication.AuthToken, error) {
	var authToken authentication.AuthToken
	err := r.authTokens.FindOne(context.TODO(), bson.M{"Token": hashedToken}).Decode(&authToken)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return authToken, authentication.ErrNoDocuments
		}
		return authToken, err
	}
	return authToken, nil
}
