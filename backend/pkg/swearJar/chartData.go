package swearJar

type ChartData struct {
	Label   string
	Metrics map[string]int
}

// Example:
// {
// 	"Label": "Saturday",
// 	"Metrics": {
// 		"userid1": 5,
// 		"userid2": 3
// 	}
// }
