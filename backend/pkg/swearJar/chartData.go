package swearJar

type ChartData struct {
	Label   string
	Metrics map[string]int
}

// Example:
// {
// 	"Label": "Saturday",
// 	"Metrics": {
// 		"John Doe": 5,
// 		"Jane Doe": 3
// 	}
// }