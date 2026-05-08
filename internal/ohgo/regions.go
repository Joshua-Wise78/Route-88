package ohgo

import "slices"

var ValidRegions = []string{
	"akron",
	"cincinnati",
	"cleveland",
	"dayton",
	"toledo",
	"central-ohio",
	"ne-ohio",
	"nw-ohio",
	"se-ohio",
	"sw-ohio",
}

func IsValidRegion(region string) bool {
	return slices.Contains(ValidRegions, region)
}
