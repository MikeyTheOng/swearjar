package authentication

type User struct {
	UserID string
	Name     string
	Password string
	Email    string
}

type UserResponse struct {
    UserID string
    Email  string
    Name   string
}