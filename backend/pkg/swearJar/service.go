package swearJar

type Service interface {
	AddSwear(Swear) error
	// TODO: GetSwears() []Swear
}

type Repository interface {
	AddSwear(Swear) error
	// TODO: GetSwears() []Swear
}

type service struct {
	r Repository
}

// NewService creates an adding service with the necessary dependencies
func NewService(r Repository) Service {
	return &service{r}
}

func (s *service) AddSwear(swear Swear) error {
	return s.r.AddSwear(swear)
}
