package rest

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"strings"

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

	// Wrap the /swearjar route with the ProtectedRouteMiddleware middleware
	mux.Handle("/swearjar", ProtectedRouteMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			swearJarId := r.URL.Query().Get("id")
			if swearJarId == "" {
				h.GetSwearJarsByUserId(w, r)
			} else {
				h.GetSwearJarById(w, r)
			}
		case http.MethodPost:
			h.CreateSwearJar(w, r)
		case http.MethodPut:
			h.UpdateSwearJar(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})))

	mux.Handle("/swearjar/{id}/trend", ProtectedRouteMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := r.URL.Path
		parts := strings.Split(strings.TrimPrefix(path, "/swearjar/"), "/")

		swearJarId := parts[0]

		switch r.Method {
		case http.MethodGet:
			if swearJarId == "" {
				http.Error(w, "Swear jar ID is required", http.StatusBadRequest)
				return
			}
			h.ServeSwearJarTrend(w, r, swearJarId)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})))

	mux.Handle("/swear", ProtectedRouteMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			h.GetSwearsWithUsers(w, r)
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

func (h *Handler) AddSwear(w http.ResponseWriter, r *http.Request) {
	type Request struct {
		UserId           string `json:"userId"`
		SwearJarId       string `json:"SwearJarId"`
		SwearDescription string `json:"SwearDescription"`
	}

	var req Request
	userId, err := GetUserIdFromCookie(w, r)
	if err != nil {
		RespondWithError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	req.UserId = userId

	err = json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		RespondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	s := swearJar.Swear{
		CreatedAt:        time.Now(),
		Active:           true,
		UserId:           req.UserId,
		SwearJarId:       req.SwearJarId,
		SwearDescription: req.SwearDescription,
	}
	err = h.sjService.AddSwear(s)
	if err != nil {
		if errors.Is(err, authentication.ErrUnauthorized) {
			RespondWithError(w, http.StatusUnauthorized, err.Error())
			return
		}
		RespondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	response := map[string]interface{}{
		"msg": "Successfully added swear",
	}

	w.WriteHeader(http.StatusCreated)
	err = json.NewEncoder(w).Encode(response)
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
}

func (h *Handler) GetSwearsWithUsers(w http.ResponseWriter, r *http.Request) {
	// * Retrieves up to 5 swears from the specified SwearJar. The SwearJarId must be provided as the "id" query parameter
	swearJarId := r.URL.Query().Get("id")
	if swearJarId == "" {
		RespondWithError(w, http.StatusBadRequest, "SwearJarId is required")
		return
	}

	userId, err := GetUserIdFromCookie(w, r)
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	data, err := h.sjService.GetSwearsWithUsers(swearJarId, userId)
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	response := map[string]interface{}{
		"msg": "swears fetched successfully",
		"data": map[string]interface{}{
			"swears": data.Swears,
			"users":  data.Users,
		},
	}

	w.WriteHeader(http.StatusOK)
	err = json.NewEncoder(w).Encode(response)
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
}

func (h *Handler) GetTopClosestEmails(w http.ResponseWriter, r *http.Request) {
	// ! Excludes the current user from the search results
	cookie, err := r.Cookie("jwt")
	// log.Printf("JWT: %v", cookie.Value)
	if err != nil {
		RespondWithError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	// Decode the UserId claim from the cookie
	claims, err := authentication.DecodeJWT(cookie.Value)
	if err != nil {
		log.Printf("Error decoding JWT: %v", err)
		RespondWithError(w, http.StatusUnauthorized, "Error decoding JWT")
		return
	}

	// Extract the UserId from the claims
	userId, ok := claims["UserId"].(string)
	if !ok {
		RespondWithError(w, http.StatusUnauthorized, "UserId not found in token")
		return
	}

	query := r.URL.Query().Get("query")
	if query == "" {
		RespondWithError(w, http.StatusBadRequest, "Query parameter is required")
		return
	}
	log.Printf("Query received: %s", query)

	results, err := h.seService.GetTopClosestEmails(query, userId)
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

func (h *Handler) CreateSwearJar(w http.ResponseWriter, r *http.Request) {
	type Request struct {
		Name   string   `bson:"name"`
		Desc   string   `bson:"desc"`
		Owners []string `bson:"owners"`
	}

	var req Request
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		log.Printf("Error decoding JSON request: %v", err)
		RespondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	sj, err := h.sjService.CreateSwearJar(req.Name, req.Desc, req.Owners)
	if err != nil {
		log.Printf("Error creating SwearJar: %v", err)
		RespondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	response := map[string]interface{}{
		"msg":      "SwearJar created successfully",
		"swearJar": sj,
	}

	w.WriteHeader(http.StatusCreated)
	err = json.NewEncoder(w).Encode(response)
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
}

func (h *Handler) UpdateSwearJar(w http.ResponseWriter, r *http.Request) {
	var body swearJar.SwearJarBase
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		log.Printf("Error decoding JSON request: %v", err)
		RespondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	userId, err := GetUserIdFromCookie(w, r)
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	err = h.sjService.UpdateSwearJar(body, userId)
	if err != nil {
		log.Printf("Error updating SwearJar: %v", err)
		RespondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	response := map[string]interface{}{
		"msg":      "SwearJar updated successfully",
		"swearJar": body,
	}

	w.WriteHeader(http.StatusOK)
	err = json.NewEncoder(w).Encode(response)
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
}

func (h *Handler) GetSwearJarsByUserId(w http.ResponseWriter, r *http.Request) {
	userId, err := GetUserIdFromCookie(w, r)
	if err != nil {
		RespondWithError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	swearJars, err := h.sjService.GetSwearJarsByUserId(userId)
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	response := map[string]interface{}{
		"msg":       "fetch successful",
		"swearJars": swearJars,
	}

	w.WriteHeader(http.StatusOK)
	err = json.NewEncoder(w).Encode(response)
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
}

func (h *Handler) GetSwearJarById(w http.ResponseWriter, r *http.Request) {
	swearJarId := r.URL.Query().Get("id")
	userId, err := GetUserIdFromCookie(w, r)
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	swearJar, err := h.sjService.GetSwearJarById(swearJarId, userId)
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	response := map[string]interface{}{
		"msg":      "fetch successful",
		"swearJar": swearJar,
	}

	w.WriteHeader(http.StatusOK)
	err = json.NewEncoder(w).Encode(response)
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
}

func (h *Handler) ServeSwearJarTrend(w http.ResponseWriter, r *http.Request, swearJarId string) {
	period := r.URL.Query().Get("period")
	if period == "" {
		RespondWithError(w, http.StatusBadRequest, "Period is required")
		return
	}

	userId, err := GetUserIdFromCookie(w, r)
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	chartData, err := h.sjService.SwearJarTrend(swearJarId, userId, period)
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	// flatten the data to match the format of the data required in the frontend
	// const chartData = [{ label: "Week 1", michael: 10, timothy: 8 },];
	var flattenedData []map[string]interface{}
	for _, data := range chartData {
		flattenedEntry := map[string]interface{}{
			"label": data.Label,
		}
		for user, value := range data.Metrics {
			flattenedEntry[user] = value
		}
		flattenedData = append(flattenedData, flattenedEntry)
	}

	response := map[string]interface{}{
		"msg":  "SwearJar trend fetched successfully",
		"data": flattenedData,
	}

	w.WriteHeader(http.StatusOK)
	err = json.NewEncoder(w).Encode(response)
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
}
