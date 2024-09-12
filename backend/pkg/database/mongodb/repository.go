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
	client    *mongo.Client
	db        *mongo.Database
	swearJars *mongo.Collection
	swears    *mongo.Collection
	users     *mongo.Collection
}

func NewMongoRepository() *MongoRepository {
	client := ConnectToDB()
	db := client.Database(os.Getenv("DB_NAME"))
	swearJars := db.Collection(os.Getenv("DB_COLLECTION_SWEARJARS"))
	swears := db.Collection(os.Getenv("DB_COLLECTION_SWEARJAR"))
	users := db.Collection(os.Getenv("DB_COLLECTION_USERS"))
	return &MongoRepository{client, db, swearJars, swears, users}
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

func (r *MongoRepository) GetSwearJarsByUserId(userId string) ([]swearJar.SwearJar, error) {
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

	var swearJars []swearJar.SwearJar
	for cursor.Next(context.TODO()) {
		var sj swearJar.SwearJar
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

func (r *MongoRepository) GetSwearJarById(swearJarId string) (swearJar.SwearJar, error) {
	swearJarIdHex, err := primitive.ObjectIDFromHex(swearJarId)
	if err != nil {
		return swearJar.SwearJar{}, fmt.Errorf("invalid SwearJarId: %v", err)
	}

	var sj swearJar.SwearJar
	filter := bson.M{"_id": swearJarIdHex}
	err = r.swearJars.FindOne(context.TODO(), filter).Decode(&sj)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return swearJar.SwearJar{}, fmt.Errorf("swear jar not found: %v", err)
		}
		return swearJar.SwearJar{}, fmt.Errorf("error fetching swear jar: %v", err)
	}

	return sj, nil
}

func (r *MongoRepository) CreateSwearJar(sj swearJar.SwearJar) (swearJar.SwearJar, error) {
	// Convert []string to []primitive.ObjectID in one go
	ownerIDs := make([]primitive.ObjectID, len(sj.Owners))
	for i, ownerID := range sj.Owners {
		oid, err := primitive.ObjectIDFromHex(ownerID)
		if err != nil {
			return swearJar.SwearJar{}, fmt.Errorf("invalid owner ID: %s", ownerID)
		}
		ownerIDs[i] = oid
	}

	// Check if all userIds in Owners field are valid users
	for _, ownerID := range ownerIDs {
		count, err := r.users.CountDocuments(context.TODO(), bson.M{"_id": ownerID})
		if err != nil {
			return swearJar.SwearJar{}, err
		}
		if count == 0 {
			return swearJar.SwearJar{}, fmt.Errorf("invalid owner ID: %s", ownerID)
		}
	}

	result, err := r.swearJars.InsertOne(
		context.TODO(),
		bson.D{
			{Key: "Name", Value: sj.Name},
			{Key: "Desc", Value: sj.Desc},
			{Key: "Owners", Value: ownerIDs},
			{Key: "CreatedAt", Value: sj.CreatedAt},
		},
	)
	if err != nil {
		return swearJar.SwearJar{}, err
	}

	// Get the inserted document
	insertedID := result.InsertedID.(primitive.ObjectID)
	filter := bson.M{"_id": insertedID}
	var createdSwearJar swearJar.SwearJar
	err = r.swearJars.FindOne(context.TODO(), filter).Decode(&createdSwearJar)
	if err != nil {
		return swearJar.SwearJar{}, err
	}

	return createdSwearJar, nil
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
