package swearJar

type SwearJar struct {
	ID     string   `json:"id"`
	Name   string   `json:"name"`
	Desc   string   `json:"desc"`
	Owners []string `json:"owners"`
}
