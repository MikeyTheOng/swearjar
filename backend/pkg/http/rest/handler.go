package rest

import (
	"encoding/json"
	"fmt"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"net/http"
	"time"

	"github.com/mikeytheong/swearjar/backend/pkg/swearJar"
)

type Handler struct {
	// authService  authentication.Service
	sjService swearJar.Service
}

func NewHandler(
	// a authentication.Service,
	s swearJar.Service) *Handler {
	return &Handler{
		// authService:  a,
		sjService: s,
	}
}

func (h *Handler) RegisterRoutes() {
	http.HandleFunc("/", h.Listening)

	// http.HandleFunc("/login", h.Login)
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

// func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
// 	// Delegate to the authentication service
// 	h.authService.Login()
// }

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

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Swear added successfully"))
}
