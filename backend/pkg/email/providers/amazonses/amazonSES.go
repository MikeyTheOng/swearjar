package amazonses

import (
	"os"
	"strconv"

	"github.com/wneessen/go-mail"
	// "github.com/mikeytheong/swearjar/backend/pkg/email"
)

func NewClient() *mail.Client {
	smtpHost := os.Getenv("AMAZON_SES_SMTP_HOST")
	smtpPort := os.Getenv("AMAZON_SES_SMTP_PORT")
	smtpUsername := os.Getenv("AMAZON_SES_SMTP_USERNAME")
	smtpPassword := os.Getenv("AMAZON_SES_SMTP_PASSWORD")

	port, _ := strconv.Atoi(smtpPort)

	client, _ := mail.NewClient(smtpHost, mail.WithPort(port), mail.WithSMTPAuth(mail.SMTPAuthPlain), mail.WithUsername(smtpUsername), mail.WithPassword(smtpPassword))
	return client
}
