package main

import (
	"log"
	"net/http"

	"github.com/joho/godotenv"
	"github.com/mikeytheong/swearjar/backend/pkg/authentication"
	"github.com/mikeytheong/swearjar/backend/pkg/database/mongodb"
	"github.com/mikeytheong/swearjar/backend/pkg/http/rest"
	"github.com/mikeytheong/swearjar/backend/pkg/swearJar"
)

func main() {
	err := godotenv.Load("../.env")
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	r := mongodb.NewMongoRepository()

	authService := authentication.NewService(r)
	swearService := swearJar.NewService(r)

	handler := rest.NewHandler(authService, swearService) // Initialize the handler with the services
	handler.RegisterRoutes()                              // Register routes

	log.Println("Server is listening on port 8080")
	log.Fatal(http.ListenAndServe(":8080", nil)) // Start the server
}
