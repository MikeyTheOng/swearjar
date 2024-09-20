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

func (r *MongoRepository) SwearJarTrend(swearJarId string, period string, numOfDataPoints int) ([]swearJar.ChartData, error) {
	// ownerIds, err := r.GetSwearJarOwners(swearJarId)
	// if err != nil {
	// 	return nil, err
	// }

	// owners := make(map[string]authentication.UserResponse) // Initialize the map
	// for _, ownerId := range ownerIds {
	// 	// log.Printf("OwnerId: %v", ownerId) // ! Debugging
	// 	user, err := r.GetUserById(ownerId)
	// 	if err != nil {
	// 		return nil, err
	// 	}
	// 	owners[ownerId] = user
	// }

	swearJarIdHex, err := primitive.ObjectIDFromHex(swearJarId)
	if err != nil {
		return nil, fmt.Errorf("invalid SwearJarId: %v", err)
	}

	var results []struct {
		Date    string         `bson:"date"`
		Metrics map[string]int `bson:"metrics"`
	}

	// preallocate formattedResult with expected number of data points
	formattedResult := make([]swearJar.ChartData, numOfDataPoints)

	switch period {
	case "days":
		startDate := time.Now().UTC().AddDate(0, 0, -numOfDataPoints+1).Truncate(24 * time.Hour)

		// * 1. Start of aggregation pipeline
		pipeline := mongo.Pipeline{
			// Step 1: Match the specific SwearJar
			{{Key: "$match", Value: bson.D{
				{Key: "_id", Value: swearJarIdHex},
			}}},
			// Step 2: Lookup Owners from users collection
			{{Key: "$lookup", Value: bson.D{
				{Key: "from", Value: "users"},
				{Key: "localField", Value: "Owners"},
				{Key: "foreignField", Value: "_id"},
				{Key: "as", Value: "owners"},
			}}},
			// Step 3: Generate a range of dates (Assuming startDate and endDate are defined)
			{{Key: "$addFields", Value: bson.D{
				{Key: "startDate", Value: startDate},
				{Key: "endDate", Value: time.Now()}, 
			}}},
			// Step 4: Create an array of all dates in the range
			{{Key: "$addFields", Value: bson.D{
				{Key: "dateArray", Value: bson.D{
					{Key: "$map", Value: bson.D{
						{Key: "input", Value: bson.D{
							{Key: "$range", Value: bson.A{
								0,
								numOfDataPoints,
							}},
						}},
						{Key: "as", Value: "dayOffset"},
						{Key: "in", Value: bson.D{
							{Key: "$dateToString", Value: bson.D{
								{Key: "format", Value: "%Y-%m-%d"},
								{Key: "date", Value: bson.D{ 
									// Convert startDate to a date object
									{Key: "$add", Value: bson.A{
										"$startDate",
										bson.D{{Key: "$multiply", Value: bson.A{"$$dayOffset", 86400000}}},
									}},
								}},
							}},
						}},
					}},
				}},
			}}},
			// Step 5: Unwind owners and dates to create all combinations
			{{Key: "$unwind", Value: bson.D{
				{Key: "path", Value: "$owners"},
			}}},
			{{Key: "$unwind", Value: bson.D{
				{Key: "path", Value: "$dateArray"},
			}}},
			// Step 6: Lookup swears for each user and date
			{{Key: "$lookup", Value: bson.D{
				{Key: "from", Value: "swears"},
				{Key: "let", Value: bson.D{
					{Key: "ownerId", Value: "$owners._id"},
					{Key: "swearJarId", Value: "$_id"},
					{Key: "date", Value: "$dateArray"},
				}},
				{Key: "pipeline", Value: mongo.Pipeline{
					{{Key: "$match", Value: bson.D{
						{Key: "$expr", Value: bson.D{
							{Key: "$and", Value: bson.A{
								bson.D{{Key: "$eq", Value: bson.A{"$SwearJarId", "$$swearJarId"}}},
								bson.D{{Key: "$eq", Value: bson.A{"$UserId", "$$ownerId"}}},
								bson.D{{Key: "$gte", Value: bson.A{"$CreatedAt", startDate}}},
								bson.D{{Key: "$eq", Value: bson.A{
									bson.D{{Key: "$dateToString", Value: bson.D{
										{Key: "format", Value: "%Y-%m-%d"},
										{Key: "date", Value: "$CreatedAt"},
									}}},
									"$$date",
								}}},
							}},
						}},
					}}},
					{{Key: "$count", Value: "count"}}, // After filtering, this stage counts the number of swears that match the criteria
				}},
				{Key: "as", Value: "swearCount"},
			}}},
			// Step 7: Add the count, defaulting to 0
			{{Key: "$addFields", Value: bson.D{
				{Key: "count", Value: bson.D{
					{Key: "$ifNull", Value: bson.A{
						bson.D{{Key: "$arrayElemAt", Value: bson.A{"$swearCount.count", 0}}}, 
						0,
					}},
				}},
			}}},
			// Step 8: Group by date to accumulate metrics
			{{Key: "$group", Value: bson.D{
				{Key: "_id", Value: "$dateArray"},
				{Key: "metrics", Value: bson.D{
					{Key: "$push", Value: bson.D{
						{Key: "k", Value: bson.D{{Key: "$toString", Value: "$owners._id"}}},
						{Key: "v", Value: "$count"},
					}},
				}},
			}}},
			// Step 9: Convert metrics array to an object
			{{Key: "$addFields", Value: bson.D{
				{Key: "metrics", Value: bson.D{
					{Key: "$arrayToObject", Value: "$metrics"},
				}},
			}}},
			// Step 10: Sort by date
			{{Key: "$sort", Value: bson.D{
				{Key: "_id", Value: 1},
			}}},
			// Step 11: Project the final structure
			{{Key: "$project", Value: bson.D{
				{Key: "date", Value: "$_id"},
				{Key: "metrics", Value: 1},
				{Key: "_id", Value: 0},
			}}},
		}
		

		cursor, err := r.swearJars.Aggregate(context.TODO(), pipeline)
		if err != nil {
			return nil, fmt.Errorf("error aggregating swears: %v", err)
		}
		defer cursor.Close(context.TODO())

		if err := cursor.All(context.TODO(), &results); err != nil {
			return nil, fmt.Errorf("error decoding aggregation results: %v", err)
		}

		// ! Debugging of pipeline results
		for _, result := range results {
			fmt.Printf("Date: %s\n", result.Date)
			for userID, metric := range result.Metrics {
				fmt.Printf("  UserID: %s, Count: %d\n", userID, metric)
				// formattedResult = append(formattedResult, swearJar.ChartData{
				// 	Label:   result.Date,
				// 	Metrics: map[string]int{userID: metric},
				// })
			}
		}

		// Define a nested map: date -> userId -> count
		// userMetrics := make(map[string]map[string]int)
		// for _, result := range results {
		// 	date, userId := result.ID.Date, result.ID.UserId
		// 	log.Printf("Date: %s, UserId: %s, Count: %d", date, userId, result.Count)
		// 	if _, ok := userMetrics[date]; !ok {
		// 		userMetrics[date] = make(map[string]int)
		// 	}

		// 	userMetrics[date][userId] = result.Count
		// }

		// ! Debugging of userMetrics
		// for date, metrics := range userMetrics {
		// 	log.Printf("Date: %s", date)
		// 	for userId, count := range metrics {
		// 		log.Printf("User: %s, Count: %d", userId, count)
		// 	}
		// }

		// * End of aggregation pipeline

		// // * 3. Precompute unique keys for owners -> {`Name|Email}
		// uniqueKeys := make(map[string]string, len(ownerIds))
		// for _, ownerId := range ownerIds {
		// 	owner := owners[ownerId]
		// 	uniqueKeys[ownerId] = fmt.Sprintf("%s|%s", owner.Name, owner.Email)
		// }

		// labels := make([]string, numOfDataPoints)
		// for i := 0; i < numOfDataPoints; i++ {
		// 	labels[i] = startDate.AddDate(0, 0, i).Format("2006-01-02")
		// }

		// for _, label := range labels {
		// 	date, _ := time.Parse("2006-01-02", label)
		// 	temp := swearJar.ChartData{
		// 		Label: date.Weekday().String(),
		// 		Metrics: make(map[string]int),
		// 	}

		// 	totalCount := 0
		// 	for _, ownerId := range ownerIds {
		// 		count := 0
		// 		for _, result := range results {
		// 			if result.ID.UserID == ownerId && result.ID.Date == label {
		// 				count = result.Count
		// 				break
		// 			}
		// 		}
		// 		owner := owners[ownerId]

		// 		uniqueKey := fmt.Sprintf("%s|%s", owner.Name, owner.Email)

		// 		temp.Metrics[uniqueKey] = count
		// 		totalCount += count
		// 	}
		// 	temp.Metrics["Total"] = totalCount
		// 	formattedResult = append(formattedResult, temp)
		// }

	case "weeks":

	case "months":
	}

	// for _, result := range formattedResult {
	// 	log.Printf("%v, %v", result.Label, result.Metrics)
	// }

	return formattedResult, nil
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

func (r *MongoRepository) GetSwears(swearJarId string, limit int) ([]swearJar.Swear, error) {
	swearJarIdHex, err := primitive.ObjectIDFromHex(swearJarId)
	if err != nil {
		return nil, fmt.Errorf("invalid SwearJarId: %v", err)
	}

	filter := bson.M{"SwearJarId": swearJarIdHex, "Active": true}
	findOptions := options.Find().SetSort(bson.D{{Key: "CreatedAt", Value: -1}}).SetLimit(int64(limit))
	cursor, err := r.swears.Find(context.TODO(), filter, findOptions)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.TODO())

	var swears []swearJar.Swear
	if err := cursor.All(context.TODO(), &swears); err != nil {
		return nil, err
	}

	return swears, nil
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
