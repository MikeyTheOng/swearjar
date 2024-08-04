package mongodb

import (
	"fmt"
	"reflect"
)

func validateRequiredFields(requiredFields []string, object map[string]interface{}) error {
	for _, field := range requiredFields {
		value, ok := object[field]
		if !ok || isEmpty(value) {
			return fmt.Errorf("missing required field: %s", field)
		}
	}
	return nil
}

func isEmpty(value interface{}) bool {
	// Check for empty string
	if str, ok := value.(string); ok {
		return str == ""
	}
	// Check for nil slice or empty slice
	v := reflect.ValueOf(value)
	switch v.Kind() {
	case reflect.Slice, reflect.Array:
		return v.Len() == 0
	}
	// Add more type checks if necessary
	return false
}
