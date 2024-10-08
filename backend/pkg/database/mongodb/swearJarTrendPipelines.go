package mongodb

import (
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

func SwearJarTrendPipeline(period string, numOfDataPoints int, startDate time.Time, swearJarIdHex interface{}) mongo.Pipeline {
	var dateFormat string
	var dateAdd bson.D
	var labelFormat bson.D

	switch period {
	case "days":
		dateFormat = "%Y-%m-%d"
		dateAdd = bson.D{{Key: "$multiply", Value: bson.A{"$$dayOffset", 24 * time.Hour.Milliseconds()}}}

		labelFormat = bson.D{
			{Key: "$switch", Value: bson.D{
				{Key: "branches", Value: bson.A{
					// Case for "Today"
					bson.D{
						{Key: "case", Value: bson.D{
							// Check if the date is today
							// $_id refers to the group key
							{Key: "$eq", Value: bson.A{
								"$_id",
								bson.D{
									{Key: "$dateToString", Value: bson.D{
										{Key: "date", Value: "$$NOW"},
										{Key: "format", Value: dateFormat},
									}},
								}}},
						}},
						{Key: "then", Value: "Today"},
					},
					// Case for "Yesterday"
					bson.D{
						{Key: "case", Value: bson.D{
							{Key: "$eq", Value: bson.A{
								"$_id",
								bson.D{
									{Key: "$dateToString", Value: bson.D{
										{Key: "date", Value: bson.D{
											{Key: "$subtract", Value: bson.A{"$$NOW", 24 * time.Hour.Milliseconds()}},
										}},
										{Key: "format", Value: dateFormat},
									}},
								}}},
						}},
						{Key: "then", Value: "Yesterday"},
					},
				}},
				{Key: "default", Value: bson.D{
					{Key: "$dateToString", Value: bson.D{
						{Key: "date", Value: bson.D{
							{Key: "$dateFromString", Value: bson.D{
								{Key: "dateString", Value: "$_id"},
							}},
						}},
						{Key: "format", Value: "%d %b"},
					}},
				}},
			}},
		}
	case "weeks":
		dateFormat = "%Y-W%V"
		dateAdd = bson.D{{Key: "$multiply", Value: bson.A{"$$weekOffset", 7 * 24 * 60 * 60 * 1000}}}
		labelFormat = bson.D{
			{Key: "$switch", Value: bson.D{
				{Key: "branches", Value: bson.A{
					// Case for "This Week"
					bson.D{
						{Key: "case", Value: bson.D{
							{Key: "$eq", Value: bson.A{
								"$_id",
								bson.D{
									{Key: "$dateToString", Value: bson.D{
										{Key: "date", Value: "$$NOW"},
										{Key: "format", Value: dateFormat},
									}},
								},
							}},
						}},
						{Key: "then", Value: "This Week"},
					},
					// Case for "Last Week"
					// bson.D{
					// 	{Key: "case", Value: bson.D{
					// 		{Key: "$eq", Value: bson.A{
					// 			"$_id",
					// 			bson.D{
					// 				{Key: "$dateToString", Value: bson.D{
					// 					{Key: "date", Value: bson.D{
					// 						{Key: "$subtract", Value: bson.A{"$$NOW", 7 * 24 * 60 * 60 * 1000}},
					// 					}},
					// 					{Key: "format", Value: dateFormat},
					// 				}},
					// 			},
					// 		}},
					// 	}},
					// 	{Key: "then", Value: "Last Week"},
					// },
				}},
				{Key: "default", Value: bson.D{
					{Key: "$concat", Value: bson.A{
						bson.D{
							{Key: "$toString", Value: bson.D{
								{Key: "$subtract", Value: bson.A{
									// Calculate the current week number
									bson.D{
										{Key: "$toInt", Value: bson.D{
											{Key: "$dateToString", Value: bson.D{
												{Key: "date", Value: "$$NOW"},
												{Key: "format", Value: "%V"},
											}},
										}},
									},
									// Extract the week number from the group key
									bson.D{
										{Key: "$toInt", Value: bson.D{
											{Key: "$arrayElemAt", Value: bson.A{
												bson.D{
													{Key: "$split", Value: bson.A{"$_id", "-W"}},
												},
												1,
											}},
										}},
									},
								}},
							}},
						},
						" Week(s) Ago",
					}},
				}},
			}},
		}
	case "months":
		dateFormat = "%Y-%m"
		dateAdd = bson.D{{Key: "$multiply", Value: bson.A{"$$monthOffset", 30 * 24 * 60 * 60 * 1000}}}
		labelFormat = bson.D{{Key: "$dateToString", Value: bson.D{
			{Key: "date", Value: bson.D{
				{Key: "$dateFromString", Value: bson.D{
					{Key: "dateString", Value: bson.D{
						{Key: "$concat", Value: bson.A{"$_id", "-01"}},
					}},
				}},
			}},
			{Key: "format", Value: "%b"},
		}}}
	}

	return mongo.Pipeline{
		// Step 1: Match the specific SwearJar
		{{Key: "$match", Value: bson.D{
			{Key: "_id", Value: swearJarIdHex},
		}}},
		// Step 2: Lookup Owners from users collection
		{{Key: "$lookup", Value: bson.D{
			{Key: "from", Value: "users"},
			{Key: "localField", Value: "Owners"},
			{Key: "foreignField", Value: "_id"},
			{Key: "as", Value: "owners"},
		}}},
		// Step 3: Generate a range of dates
		{{Key: "$addFields", Value: bson.D{
			{Key: "startDate", Value: startDate},
			{Key: "endDate", Value: time.Now()},
		}}},
		// Step 4: Create an array of all dates/weeks/months in the range
		{{Key: "$addFields", Value: bson.D{
			{Key: "dateArray", Value: bson.D{
				{Key: "$map", Value: bson.D{
					{Key: "input", Value: bson.D{
						{Key: "$range", Value: bson.A{0, numOfDataPoints}},
					}},
					{Key: "as", Value: period[:len(period)-1] + "Offset"}, // daysOffset, weeksOffset, monthsOffset
					{Key: "in", Value: bson.D{
						{Key: "$dateToString", Value: bson.D{
							{Key: "format", Value: dateFormat},
							{Key: "date", Value: bson.D{
								{Key: "$subtract", Value: bson.A{
									"$endDate",
									dateAdd,
								}},
							}},
						}},
					}},
				}},
			}},
		}}},
		// Step 5: Unwind owners and dates to create all combinations
		{{Key: "$unwind", Value: bson.D{
			{Key: "path", Value: "$owners"},
		}}},
		{{Key: "$unwind", Value: bson.D{
			{Key: "path", Value: "$dateArray"},
		}}},
		// Step 6: Lookup swears for each user and date/week/month
		{{Key: "$lookup", Value: bson.D{
			{Key: "from", Value: "swears"},
			{Key: "let", Value: bson.D{
				{Key: "ownerId", Value: "$owners._id"},
				{Key: "swearJarId", Value: "$_id"},
				{Key: "date", Value: "$dateArray"},
			}},
			{Key: "pipeline", Value: mongo.Pipeline{
				{{Key: "$match", Value: bson.D{
					{Key: "$expr", Value: bson.D{
						{Key: "$and", Value: bson.A{
							bson.D{{Key: "$eq", Value: bson.A{"$SwearJarId", "$$swearJarId"}}},
							bson.D{{Key: "$eq", Value: bson.A{"$UserId", "$$ownerId"}}},
							bson.D{{Key: "$gte", Value: bson.A{"$CreatedAt", startDate}}},
							bson.D{{Key: "$eq", Value: bson.A{
								bson.D{{Key: "$dateToString", Value: bson.D{
									{Key: "format", Value: dateFormat},
									{Key: "date", Value: "$CreatedAt"},
								}}},
								"$$date",
							}}},
						}},
					}},
				}}},
				{{Key: "$count", Value: "count"}},
			}},
			{Key: "as", Value: "swearCount"},
		}}},
		// Step 7: Add the count, defaulting to 0
		{{Key: "$addFields", Value: bson.D{
			{Key: "count", Value: bson.D{
				{Key: "$ifNull", Value: bson.A{
					bson.D{{Key: "$arrayElemAt", Value: bson.A{"$swearCount.count", 0}}},
					0,
				}},
			}},
		}}},
		// Step 8: Group by date to accumulate metrics
		// $group -> Identifies all documents that share the same group key
		// Inside each group, you can run various accumulation operations on the data from the individual documents like $push, $sum, $avg, etc.
		// $push -> Push fields from the input documents to an array in the output document
		{{Key: "$group", Value: bson.D{
			{Key: "_id", Value: "$dateArray"},
			{Key: "metrics", Value: bson.D{
				{Key: "$push", Value: bson.D{
					{Key: "k", Value: bson.D{{Key: "$concat", Value: bson.A{
						bson.D{{Key: "$toString", Value: "$owners._id"}},
						"|-|",
						"$owners.Name",
						"|-|",
						"$owners.Email",
					}}}},
					{Key: "v", Value: "$count"},
				}},
			}},
		}}},
		// Step 9: Convert metrics array to an object
		{{Key: "$addFields", Value: bson.D{
			{Key: "metrics", Value: bson.D{
				{Key: "$arrayToObject", Value: "$metrics"},
			}},
		}}},
		// Step 10: Sort by date
		{{Key: "$sort", Value: bson.D{
			{Key: "_id", Value: 1},
		}}},
		// Step 11: Project the final structure
		{{Key: "$project", Value: bson.D{
			{Key: "Label", Value: labelFormat},
			{Key: "Metrics", Value: "$metrics"},
			{Key: "_id", Value: 0},
		}}},
	}
}
