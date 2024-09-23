package authentication

type User struct {
	UserId   string
	Name     string
	Password string
	Email    string
}

type UserResponse struct {
	UserId string `bson:"_id"`
	Email  string
	Name   string
}
