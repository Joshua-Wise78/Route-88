import type {
	DangerousSlowDown,
	OhgoApiResponse,
} from "../../../src/types/ohgo";

export const createMockDangerousSlowdown = (
	overrides?: Partial<DangerousSlowDown>,
): DangerousSlowDown => ({
	id: "slowdown-ohgo-9002",
	latitude: 39.9612,
	longitude: -82.9988,
	location: "I-70 Eastbound at Mile Marker 105",
	description: "Slowdowns expected for 5 minutes.",
	category: "Slowdown",
	direction: "Northbound",
	routeName: "I-70",
	normalMPH: 70,
	currentMPH: 55,
	links: [
		{
			href: "https://publicapi.ohgo.com/api/v1/dangerousslowdown/slowdown-ohgo-9002",
			rel: "self",
			method: "GET",
		},
	],
	...overrides,
});

export const createMockDangerousSlowdownResponse = (
	slowdowns: DangerousSlowDown[] = [],
): OhgoApiResponse<DangerousSlowDown> => ({
	links: [],
	totalPageCount: 1,
	totalResultCount: slowdowns.length,
	currentResultCount: slowdowns.length,
	results: slowdowns,
});

export const mockDangerousSlowdownListResponse =
	createMockDangerousSlowdownResponse([
		createMockDangerousSlowdown({
			id: "slowdown-101",
			category: "Slowdown",
			normalMPH: 70,
			currentMPH: 35,
		}),
		createMockDangerousSlowdown({
			id: "slowdown-102",
			category: "Hazard",
			normalMPH: 55,
			currentMPH: 5,
		}),
	]);

export const mockEmptySlowdownResponse = createMockDangerousSlowdownResponse(
	[],
);
