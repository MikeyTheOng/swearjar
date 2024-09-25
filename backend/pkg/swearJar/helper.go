package swearJar

func (s *service) IsOwner(swearJarId string, userId string) (bool, error) {
	owners, err := s.r.GetSwearJarOwners(swearJarId)
	if err != nil {
		return false, err
	}

	for _, ownerID := range owners {
		if ownerID == userId {
			return true, nil
		}
	}

	return false, nil
}
