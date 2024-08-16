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

	handler := rest.NewHandler(authService, swearService, searchService) // Initialize the handler with the services
	mux := handler.RegisterRoutes()

	// Paths to your certificate and key files
	certFile := "../../localhost+2.pem"
	keyFile := "../../localhost+2-key.pem"

	log.Println("Server is listening on port 8080")
	err = http.ListenAndServeTLS(":8080", certFile, keyFile, mux)
	if err != nil {
		log.Fatalf("Failed to start HTTPS server: %v", err)
	}
}
