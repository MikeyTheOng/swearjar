package rest

import (
	"encoding/json"
	"errors"
	"fmt"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"net/http"
	"time"

	"github.com/mikeytheong/swearjar/backend/pkg/authentication"
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

func (h *Handler) RegisterRoutes() {
	http.HandleFunc("/", h.Listening)

	http.HandleFunc("/users", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			if r.URL.Query().Get("action") == "login" {
				h.Login(w, r)
			} else {
				h.SignUp(w, r)
			}
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	http.HandleFunc("/swear", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			// h.GetSwears(w, r)
		case http.MethodPost:
			h.AddSwear(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})
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

	jwt, err := h.authService.Login(req)
	if err != nil {
		if errors.Is(err, authentication.ErrUnauthorized) {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	response := map[string]interface{}{
		"msg":   "Logged in successfully",
		"token": jwt,
	}

	w.Header().Set("Content-Type", "application/json")
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
