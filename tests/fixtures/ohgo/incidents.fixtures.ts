import type { Incident, OhgoApiResponse } from "../../../src/types/ohgo";

export const createMockIncident = (
	overrides?: Partial<Incident>,
): Incident => ({
	id: "inc-ohgo-9001",
	latitude: 39.9612,
	longitude: -82.9988,
	location: "I-70 Eastbound at Mile Marker 105",
	description: "Right lane blocked due to collision",
	category: "Accident",
	direction: "Eastbound",
	routeName: "I-70",
	roadStatus: "Restricted",
	links: [
		{
			href: "https://publicapi.ohgo.com/api/v1/incidents/inc-ohgo-9001",
			rel: "self",
			method: "GET",
		},
	],
	roadClosureDetail: {
		closureStartLocation: [39.9612, -82.9988],
		closureEndLocation: [39.965, -82.882],
		polyline: [
			[39.9612, -82.9988],
			[39.965, -82.992],
		],
	},
	...overrides,
});

export const createMockIncidentResponse = (
	incidents: Incident[] = [],
): OhgoApiResponse<Incident> => ({
	links: [],
	totalPageCount: 1,
	totalResultCount: incidents.length,
	currentResultCount: incidents.length,
	results: incidents,
});

export const mockIncidentListResponse = createMockIncidentResponse([
	createMockIncident({
		id: "inc-101",
		category: "Accident",
		roadStatus: "Closed",
	}),
	createMockIncident({
		id: "inc-102",
		category: "Harzard",
		roadStatus: "Restricted",
	}),
]);

export const mockEmptyIncidentResponse = createMockIncidentResponse([]);
