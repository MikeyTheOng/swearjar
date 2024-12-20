package main

import (
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/joho/godotenv"
	"github.com/mikeytheong/swearjar/backend/pkg/authentication"
	"github.com/mikeytheong/swearjar/backend/pkg/database/mongodb"
	"github.com/mikeytheong/swearjar/backend/pkg/email"
	"github.com/mikeytheong/swearjar/backend/pkg/email/providers/amazonses"
	"github.com/mikeytheong/swearjar/backend/pkg/http/rest"
	"github.com/mikeytheong/swearjar/backend/pkg/search"
	"github.com/mikeytheong/swearjar/backend/pkg/swearJar"
)

func main() {
	dir, err := os.Getwd()
	if err != nil {
		log.Fatal("Error getting working directory")
	}
	log.Printf("Working directory: %s", dir)
	envPath, err := filepath.Abs("../.env")
	if err != nil {
		log.Fatal("Error getting absolute path for .env")
	}
	log.Printf("Checking .env at: %s", envPath)
	err = godotenv.Load(envPath)
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	p := amazonses.NewClient() // Email Service Provider Client
	e := email.NewService(p)
	r := mongodb.NewMongoRepository()

	authService := authentication.NewService(r, e)
	swearService := swearJar.NewService(r)
	searchService := search.NewService(r)

	handler := rest.NewHandler(authService, swearService, searchService) // Initialize the handler with the services
	mux := handler.RegisterRoutes()

	// Paths to your certificate and key files
	// certFile := "../../localhost+2.pem"
	// keyFile := "../../localhost+2-key.pem"

	log.Println("Server is listening on port 8080")
	// err = http.ListenAndServeTLS(":8080", certFile, keyFile, mux)
	err = http.ListenAndServe(":8080", mux)
	if err != nil {
		// log.Fatalf("Failed to start HTTPS server: %v", err)
		log.Fatalf("Failed to start HTTP server: %v", err)
	}
}
