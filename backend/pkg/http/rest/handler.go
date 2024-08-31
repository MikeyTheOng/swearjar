package rest

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"

	// "os"
	"net/http"
	// "strconv"
	"time"

	"github.com/mikeytheong/swearjar/backend/pkg/authentication"
	"github.com/mikeytheong/swearjar/backend/pkg/search"
	"github.com/mikeytheong/swearjar/backend/pkg/swearJar"
)

type Handler struct {
	authService authentication.Service
	sjService   swearJar.Service
	seService   search.Service
}

func NewHandler(a authentication.Service, sj swearJar.Service, se search.Service) *Handler {
	return &Handler{
		authService: a,
		sjService:   sj,
		seService:   se,
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
	mux.Handle("/swearjar", ProtectedRouteMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			// h.GetSwears(w, r)
		case http.MethodPost:
			h.CreateSwearJar(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})))

	mux.Handle("/swear", ProtectedRouteMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			// h.GetSwears(w, r)
		case http.MethodPost:
			h.AddSwear(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})))

	mux.Handle("/search/user", ProtectedRouteMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			h.GetTopClosestEmails(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})))

	// Wrap the entire mux with the CORSMiddleware
	return CORSMiddleware(mux)
}

func (h *Handler) Listening(w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, "Server is listening")
}

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	var req authentication.User
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		RespondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	ur, jwt, csrfToken, err := h.authService.Login(req)
	if err != nil {
		if errors.Is(err, authentication.ErrUnauthorized) {
			RespondWithError(w, http.StatusUnauthorized, "Unauthorized")
		} else {
			RespondWithError(w, http.StatusInternalServerError, err.Error())
		}
		return
	}

	// set jwt in httpOnly cookie and set csrf in both httpOnly & non-HttpOnly cookies
	SetCookie(w, "jwt", jwt, true)
	SetCookie(w, "csrf_token_http_only", csrfToken, true)
	SetCookie(w, "csrf_token", csrfToken, false)

	response := map[string]interface{}{
		"msg":  "Logged in successfully",
		"user": ur,
	}

	w.WriteHeader(http.StatusOK)
	err = json.NewEncoder(w).Encode(response)
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
}

func (h *Handler) SignUp(w http.ResponseWriter, r *http.Request) {
	var req authentication.User
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		RespondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	err = h.authService.SignUp(req)
	if err != nil {
		log.Printf("Error during SignUp: %v", err)
		RespondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	w.WriteHeader(http.StatusCreated)
	err = json.NewEncoder(w).Encode(map[string]string{"msg": "User signed up successfully"})
	if err != nil {
		log.Printf("Error encoding JSON response: %v", err)
		RespondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
}

func (h *Handler) CreateSwearJar(w http.ResponseWriter, r *http.Request) {
	type Request struct {
		Name   string   `bson:"name"`
		Desc   string   `bson:"desc"`
		Owners []string `bson:"owners"`
	}

	var req Request
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	err = h.sjService.CreateSwearJar(req.Name, req.Desc, req.Owners)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("SwearJar created successfully"))
}

func (h *Handler) AddSwear(w http.ResponseWriter, r *http.Request) {
	type Request struct {
		UserId     string `json:"userId"`
		SwearJarId string `json:"SwearJarId"`
	}

	var req Request
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	s := swearJar.Swear{
		DateTime:   time.Now(),
		Active:     true,
		UserId:     req.UserId,
		SwearJarId: req.SwearJarId,
	}
	err = h.sjService.AddSwear(s)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("Swear added successfully"))
}

func (h *Handler) GetTopClosestEmails(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("query")
	if query == "" {
		RespondWithError(w, http.StatusBadRequest, "Query parameter is required")
		return
	}
	log.Printf("Query received: %s", query)

	results, err := h.seService.GetTopClosestEmails(query)
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	response := map[string]interface{}{
		"msg":     "search is successful",
		"results": results,
	}

	w.WriteHeader(http.StatusOK)
	err = json.NewEncoder(w).Encode(response)
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
}
