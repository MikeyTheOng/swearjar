package authentication

type PurposeType string

const (
	PurposePasswordReset   PurposeType = "PasswordReset"
	PurposeEmailVerify     PurposeType = "EmailVerify"
	PurposeAccountCreation PurposeType = "AccountCreation"
)

func (p PurposeType) IsValid() bool {
	switch p {
	case PurposePasswordReset, PurposeEmailVerify, PurposeAccountCreation:
		return true
	default:
		return false
	}
}
