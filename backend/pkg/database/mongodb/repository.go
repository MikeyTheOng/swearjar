package mongodb

import (
	"context"
	"errors"
	"fmt"
	"log"
	"os"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
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

func (r *MongoRepository) CreateSwearJar(sj swearJar.SwearJar) error {
	requiredFields := []string{"Name", "Desc", "Owners"}
	err := validateRequiredFields(requiredFields, map[string]interface{}{
		"Name":   sj.Name,
		"Desc":   sj.Desc,
		"Owners": sj.Owners,
	})
	if err != nil {
		return err
	}

	// Convert []string to []primitive.ObjectID in one go
	ownerIDs := make([]primitive.ObjectID, len(sj.Owners))
	for i, ownerID := range sj.Owners {
		oid, err := primitive.ObjectIDFromHex(ownerID)
		if err != nil {
			return fmt.Errorf("invalid owner ID: %s", ownerID)
		}
		ownerIDs[i] = oid
	}

	// Check if all userIds in Owners field are valid users
	for _, ownerID := range ownerIDs {
		count, err := r.users.CountDocuments(context.TODO(), bson.M{"_id": ownerID})
		if err != nil {
			return err
		}
		if count == 0 {
			return fmt.Errorf("invalid owner ID: %s", ownerID)
		}
	}

	_, err = r.swearJars.InsertOne(
		context.TODO(),
		bson.D{
			{Key: "Name", Value: sj.Name},
			{Key: "Desc", Value: sj.Desc},
			{Key: "Owners", Value: sj.Owners},
		},
	)
	return err
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
	userIDHex, err := primitive.ObjectIDFromHex(s.UserID)
	if err != nil {
		return fmt.Errorf("invalid UserID: %v", err)
	}

	swearJarIdHex, err := primitive.ObjectIDFromHex(s.SwearJarId)
	if err != nil {
		return fmt.Errorf("invalid SwearJarId: %v", err)
	}

	_, err = r.swears.InsertOne(
		context.TODO(),
		bson.D{
			{Key: "DateTime", Value: s.DateTime},
			{Key: "Active", Value: s.Active},
			{Key: "UserID", Value: userIDHex},
			{Key: "SwearJarId", Value: swearJarIdHex},
		},
	)

	// Debugging
	// const layout = "Jan 2, 2006 at 3:04pm (MST)"
	// fmt.Printf("Added Swear{DateTime: %v, Active: %v, UserID: %V}\n", s.DateTime.Format(layout), s.Active, s.UserID.Hex())
	return err
}

func (r *MongoRepository) SignUp(u authentication.User) error {
	requiredFields := []string{"Email", "Name", "Password"}
	err := validateRequiredFields(requiredFields, map[string]interface{}{
		"Email":    u.Email,
		"Name":     u.Name,
		"Password": u.Password,
	})
	if err != nil {
		return err
	}

	_, err = r.users.InsertOne(
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
	var result authentication.User
	err := r.users.FindOne(context.TODO(), filter).Decode(&result)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return result, authentication.ErrUnauthorized
		}
		return result, err
	}
	return result, nil
}
