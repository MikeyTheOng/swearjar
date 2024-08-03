package mongodb

import "fmt"

func validateRequiredFields(requiredFields []string, object map[string]interface{}) error {
	for _, field := range requiredFields {
		value, ok := object[field]
		if value == "" || !ok {
			return fmt.Errorf("missing required field: %s", field)
		}
	}
	return nil
}
