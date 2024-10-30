package authentication

type User struct {
	UserId   string `bson:"_id"`
	Name     string
	Password string
	Email    string
	Verified bool
}

type UserResponse struct {
	UserId   string `bson:"_id"`
	Email    string
	Name     string
	Verified bool
}

func NewUser(email string, name string, password string) User {
	return User{
		Email:    email,
		Name:     name,
		Password: password,
		Verified: false,
	}
}
