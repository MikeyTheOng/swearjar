package email

import (
	ht "html/template"
	"log"
	"os"

	"github.com/wneessen/go-mail"
)

type Service interface {
	SendEmail(to string, subject string, body *ht.Template, data interface{}) error
}

type service struct {
	client *mail.Client
	sender string
}

// NewService creates an adding service with the necessary dependencies
func NewService(providerClient *mail.Client) Service {
	sender := os.Getenv("SENDER_ADDRESS")
	return &service{providerClient, sender}
}

func (s *service) SendEmail(to string, subject string, body *ht.Template, data interface{}) error {
	m := mail.NewMsg()
	if err := m.From(s.sender); err != nil {
		log.Printf("Error with From: %v", err)
	}
	if err := m.To(to); err != nil {
		log.Printf("Error with To: %v", err)
	}
	m.Subject(subject)
	m.SetBodyHTMLTemplate(body, data)

	log.Printf("EmailService: About to send email to %s", to) // ! Debug
	return s.client.DialAndSend(m)
}
