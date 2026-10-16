import type { Construction, OhgoApiResponse } from "../../../src/types/ohgo";

export const createMockConstruction = (
	overrides?: Partial<Construction>,
): Construction => ({
	id: "con-ohgo-9001",
	latitude: 39.9612,
	longitude: -82.9988,
	location: "I-70 Eastbound at Mile Marker 104",
	description: "Right lane closed for road construction and resurfacing",
	category: "Construction Site",
	direction: "Northbound",
	routeName: "I-70",
	status: "Active",
	district: "District 6",
	startDate: "2026-10-01T07:00:00Z",
	endDate: "2026-11-01T17:00:00Z",
	links: [
		{
			href: "https://publicapi.ohgo.com/api/v1/construction/con-ohgo-9001",
			rel: "self",
			method: "GET",
		},
	],
	workZones: [
		{
			description: "Right lane closed for resurfacing operations",
			startLocation: [39.9612, -82.9988],
			endLocation: [39.965, -82.992],
			polyLine: [
				[39.9612, -82.9988],
				[39.965, -82.992],
			],
		},
	],
	detours: [],
	...overrides,
});

export const createMockConstructionResponse = (
	construction: Construction[] = [],
): OhgoApiResponse<Construction> => ({
	links: [],
	totalPageCount: 1,
	totalResultCount: construction.length,
	currentResultCount: construction.length,
	results: construction,
});

export const mockConstructionListResponse = createMockConstructionResponse([
	createMockConstruction({
		id: "con-101",
		category: "Roadwork",
		status: "Active",
	}),
	createMockConstruction({
		id: "con-102",
		category: "Bridge Repair",
		status: "Active",
	}),
]);

export const mockEmptyConstructionResponse = createMockConstructionResponse([]);
