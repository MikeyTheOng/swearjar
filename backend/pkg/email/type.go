package email

import (
	"github.com/wneessen/go-mail"
)

type EmailProvider struct {
	client *mail.Client
}

type PlainMessage struct {
	From    string
	To      string
	Subject string
	Body    string
}
