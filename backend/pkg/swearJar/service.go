package swearJar

type Service interface {
	CreateSwearJar(SwearJar) error
	AddSwear(Swear) error
	// TODO: GetSwears() []Swear
}

type Repository interface {
	CreateSwearJar(SwearJar) error
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

func (s *service) CreateSwearJar(sj SwearJar) error {
	return s.r.CreateSwearJar(sj)
}

func (s *service) AddSwear(swear Swear) error {
	return s.r.AddSwear(swear)
}
