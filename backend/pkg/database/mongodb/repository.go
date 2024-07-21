package mongodb

import (
	"context"
	"fmt"
	"log"
	"os"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/mikeytheong/swearjar/backend/pkg/authentication"
	"github.com/mikeytheong/swearjar/backend/pkg/swearJar"
)

type MongoRepository struct {
	client *mongo.Client
	db     *mongo.Database
	swears *mongo.Collection
	users  *mongo.Collection
}

func NewMongoRepository() *MongoRepository {
	client := ConnectToDB()
	db := client.Database(os.Getenv("DB_NAME"))
	swears := db.Collection(os.Getenv("DB_COLLECTION_SWEARJAR"))
	users := db.Collection(os.Getenv("DB_COLLECTION_USERS"))
	return &MongoRepository{client, db, swears, users}
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

func (r *MongoRepository) AddSwear(s swearJar.Swear) error {
	_, err := r.swears.InsertOne(
		context.TODO(),
		bson.D{
			{Key: "DateTime", Value: s.DateTime},
			{Key: "UserID", Value: s.UserID},
			{Key: "Active", Value: s.Active},
		},
	)
	if err != nil {
		return err
	}

	// // Debugging
	// const layout = "Jan 2, 2006 at 3:04pm (MST)"
	// fmt.Printf("Added Swear{DateTime: %v, Active: %v, UserID: %V}\n", s.DateTime.Format(layout), s.Active, s.UserID.Hex())
	return nil
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
	if err != nil {
		return err
	}
	return nil
}

// func (r *MongoRepository) Login() (authentication.User, error) {
// 	return struct{}{}, nil
// }
