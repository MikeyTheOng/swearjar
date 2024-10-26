package authentication

type PurposeType string

const (
	PurposePasswordReset     PurposeType = "PasswordReset"
	PurposeEmailVerification PurposeType = "EmailVerification"
)

func (p PurposeType) IsValid() bool {
	switch p {
	case PurposePasswordReset, PurposeEmailVerification:
		return true
	default:
		return false
	}
}
