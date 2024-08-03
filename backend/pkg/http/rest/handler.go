package rest

import (
	"encoding/json"
	"errors"
	"fmt"

	"go.mongodb.org/mongo-driver/bson/primitive"

	// "os"
	"net/http"
	// "strconv"
	"time"

	"github.com/mikeytheong/swearjar/backend/pkg/authentication"
	"github.com/mikeytheong/swearjar/backend/pkg/middleware"
	"github.com/mikeytheong/swearjar/backend/pkg/swearJar"
)

type Handler struct {
	authService authentication.Service
	sjService   swearJar.Service
}

func NewHandler(a authentication.Service, s swearJar.Service) *Handler {
	return &Handler{
		authService: a,
		sjService:   s,
	}
}

func (h *Handler) RegisterRoutes() http.Handler {
	// Middleware is executed in the reverse order of wrapping, ensuring CORS validation occurs before JWT and CSRF checks
	mux := http.NewServeMux()
	mux.HandleFunc("/", h.Listening)

	mux.HandleFunc("/users", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			action := r.URL.Query().Get("action")
			if action == "login" {
				h.Login(w, r)
			} else if action == "signup" {
				h.SignUp(w, r)
			} else {
				http.Error(w, "Invalid action", http.StatusBadRequest)
			}
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	// Wrap the /swear route with the ProtectedRouteMiddleware middleware
	mux.Handle("/swearjar", middleware.ProtectedRouteMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			// h.GetSwears(w, r)
		case http.MethodPost:
			h.CreateSwearJar(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})))

	mux.Handle("/swear", middleware.ProtectedRouteMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			// h.GetSwears(w, r)
		case http.MethodPost:
			h.AddSwear(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})))

	// Wrap the entire mux with the CORSMiddleware
	return middleware.CORSMiddleware(mux)
}

func (h *Handler) Listening(w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, "Server is listening")
}

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	var req authentication.User
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	jwt, csrfToken, err := h.authService.Login(req)
	if err != nil {
		if errors.Is(err, authentication.ErrUnauthorized) {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	// set jwt in httpOnly cookie and set csrf in both httpOnly & non-HttpOnly cookies
	SetCookie(w, "jwt", jwt, true)
	SetCookie(w, "csrf_token_http_only", csrfToken, true)
	SetCookie(w, "csrf_token", csrfToken, false)

	response := map[string]interface{}{
		"msg": "Logged in successfully",
	}

	w.WriteHeader(http.StatusOK)
	err = json.NewEncoder(w).Encode(response)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (h *Handler) SignUp(w http.ResponseWriter, r *http.Request) {
	var req authentication.User
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	err = h.authService.SignUp(req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("User signed up successfully"))
}

func (h *Handler) CreateSwearJar(w http.ResponseWriter, r *http.Request) {
	type Request struct {
		Name   string               `bson:"name"`
		Desc   string               `bson:"desc"`
		Owners []primitive.ObjectID `bson:"owners"`
	}

	var req Request
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	sj := swearJar.SwearJar{
		Name:   req.Name,
		Desc:   req.Desc,
		Owners: req.Owners,
	}

	err = h.sjService.CreateSwearJar(sj)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("SwearJar created successfully"))
}

func (h *Handler) AddSwear(w http.ResponseWriter, r *http.Request) {
	type Request struct {
		UserID primitive.ObjectID `json:"userID"`
	}

	var req Request
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	s := swearJar.Swear{
		DateTime: time.Now(),
		Active:   true,
		UserID:   req.UserID,
	}

	err = h.sjService.AddSwear(s)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("Swear added successfully"))
}
