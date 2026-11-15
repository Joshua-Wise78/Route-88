import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { ohgoService } from "../../../src/services/ohgo";
import { routeService } from "../../../src/services/osrm";
import { routeCheckService } from "../../../src/services/route-check";
import {
	createMockConstruction,
	createMockIncident,
} from "../../fixtures";

jest.mock("../../../src/services/ohgo");
jest.mock("../../../src/services/osrm");

describe("Route Check Service (route-check.ts)", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("returns clear status when no hazards exist along the corridor", async () => {
		jest.mocked(routeService.getRoute).mockResolvedValueOnce({
			distance: 160934.4, // ~100 miles in meters
			duration: 5400,
			geometry: {
				type: "LineString",
				coordinates: [
					[-83.0, 39.0],
					[-83.5, 39.5],
					[-84.0, 40.0],
				],
			},
			startLocation: { lat: 39.0, lon: -83.0 },
			endLocaiton: { lat: 40.0, lon: -84.0 },
			steps: [],
		});

		jest.mocked(ohgoService.getIncidents).mockResolvedValueOnce({
			links: [],
			totalPageCount: 1,
			totalResultCount: 0,
			currentResultCount: 0,
			results: [],
		});
		jest.mocked(ohgoService.getDangerousSlowdowns).mockResolvedValueOnce({
			links: [],
			totalPageCount: 1,
			totalResultCount: 0,
			currentResultCount: 0,
			results: [],
		});
		jest.mocked(ohgoService.getConstruction).mockResolvedValueOnce({
			links: [],
			totalPageCount: 1,
			totalResultCount: 0,
			currentResultCount: 0,
			results: [],
		});

		const result = await routeCheckService.checkRoute({
			startLat: 39.0,
			startLon: -83.0,
			endLat: 40.0,
			endLon: -84.0,
			bufferMiles: 0.5,
		});

		expect(result.success).toBe(true);
		expect(result.isClear).toBe(true);
		expect(result.status).toBe("clear");
		expect(result.summary.totalHazards).toBe(0);
		expect(result.hazards).toHaveLength(0);
		expect(result.route.isEstimatedRoute).toBe(false);
	});

	it("detects hazards within buffer and orders them by mile marker on route", async () => {
		const polyline: [number, number][] = [
			[-84.0, 39.0], // Mile 0
			[-83.5, 39.0], // ~27 miles
			[-83.0, 39.0], // ~54 miles
		];

		// Mock route service
		jest.mocked(routeService.getRoute).mockResolvedValueOnce({
			distance: 86900,
			duration: 3600,
			geometry: {
				type: "LineString",
				coordinates: polyline,
			},
			startLocation: { lat: 39.0, lon: -84.0 },
			endLocaiton: { lat: 39.0, lon: -83.0 },
			steps: [],
		});

		// Incident 1: Near mile 10 (on route)
		const incidentNearStart = createMockIncident({
			id: "inc-1",
			latitude: 39.001,
			longitude: -83.8,
			category: "Accident",
			description: "Fender bender on right shoulder",
			location: "I-71 Mile Marker 10",
			direction: "Northbound",
			routeName: "I-71",
			roadStatus: "open",
		});

		// Incident 2: Far off route (10 miles north) -> should be excluded
		const incidentFarAway = createMockIncident({
			id: "inc-far",
			latitude: 39.15,
			longitude: -83.5,
			category: "Accident",
			description: "Far away crash",
			location: "Local road",
			direction: "Eastbound",
			routeName: "SR-32",
			roadStatus: "open",
		});

		// Construction: Near mile 40
		const constructionNearEnd = createMockConstruction({
			id: "const-1",
			latitude: 39.001,
			longitude: -83.2,
			category: "Road Work",
			description: "Bridge maintenance",
			location: "I-71 Mile Marker 40",
			direction: "Northbound",
			routeName: "I-71",
		});

		jest.mocked(ohgoService.getIncidents).mockResolvedValueOnce({
			links: [],
			totalPageCount: 1,
			totalResultCount: 2,
			currentResultCount: 2,
			results: [incidentNearStart, incidentFarAway],
		});
		jest.mocked(ohgoService.getDangerousSlowdowns).mockResolvedValueOnce({
			links: [],
			totalPageCount: 1,
			totalResultCount: 0,
			currentResultCount: 0,
			results: [],
		});
		jest.mocked(ohgoService.getConstruction).mockResolvedValueOnce({
			links: [],
			totalPageCount: 1,
			totalResultCount: 1,
			currentResultCount: 1,
			results: [constructionNearEnd],
		});

		const result = await routeCheckService.checkRoute({
			startLat: 39.0,
			startLon: -84.0,
			endLat: 39.0,
			endLon: -83.0,
			bufferMiles: 0.5,
		});

		expect(result.success).toBe(true);
		expect(result.isClear).toBe(false);
		expect(result.summary.totalHazards).toBe(2);
		expect(result.hazards).toHaveLength(2);

		// Verified that the far-away incident was filtered out
		const hazardIds = result.hazards.map((h) => h.id);
		expect(hazardIds).toContain("inc-1");
		expect(hazardIds).toContain("const-1");
		expect(hazardIds).not.toContain("inc-far");

		// Verified hazards are sorted in driving order (first inc-1, then const-1)
		expect(result.hazards[0]!.id).toBe("inc-1");
		expect(result.hazards[1]!.id).toBe("const-1");
		expect(result.hazards[0]!.mileMarkerOnRoute).toBeLessThan(
			result.hazards[1]!.mileMarkerOnRoute,
		);
	});

	it("flags severe hazards when a road closure is detected", async () => {
		jest.mocked(routeService.getRoute).mockResolvedValueOnce({
			distance: 50000,
			duration: 2000,
			geometry: {
				type: "LineString",
				coordinates: [
					[-83.0, 39.0],
					[-83.0, 39.5],
				],
			},
			startLocation: { lat: 39.0, lon: -83.0 },
			endLocaiton: { lat: 39.5, lon: -83.0 },
			steps: [],
		});

		const closedIncident = createMockIncident({
			id: "inc-closed",
			latitude: 39.2,
			longitude: -83.0,
			category: "Major Crash",
			description: "All lanes closed due to hazardous material spill",
			location: "I-71 North",
			direction: "Northbound",
			routeName: "I-71",
			roadStatus: "Closed",
		});

		jest.mocked(ohgoService.getIncidents).mockResolvedValueOnce({
			links: [],
			totalPageCount: 1,
			totalResultCount: 1,
			currentResultCount: 1,
			results: [closedIncident],
		});
		jest.mocked(ohgoService.getDangerousSlowdowns).mockResolvedValueOnce({
			links: [],
			totalPageCount: 1,
			totalResultCount: 0,
			currentResultCount: 0,
			results: [],
		});
		jest.mocked(ohgoService.getConstruction).mockResolvedValueOnce({
			links: [],
			totalPageCount: 1,
			totalResultCount: 0,
			currentResultCount: 0,
			results: [],
		});

		const result = await routeCheckService.checkRoute({
			startLat: 39.0,
			startLon: -83.0,
			endLat: 39.5,
			endLon: -83.0,
			bufferMiles: 0.5,
		});

		expect(result.isClear).toBe(false);
		expect(result.status).toBe("severe_hazards");
		expect(result.hazards[0]!.isRoadClosed).toBe(true);
		expect(result.hazards[0]!.severity).toBe("critical");
		expect(result.summary.message).toContain("CAUTION");
	});

	it("falls back gracefully to straight-line corridor when OSRM fails", async () => {
		jest.mocked(routeService.getRoute).mockRejectedValueOnce(
			new Error("OSRM connection refused"),
		);

		jest.mocked(ohgoService.getIncidents).mockResolvedValueOnce({
			links: [],
			totalPageCount: 1,
			totalResultCount: 0,
			currentResultCount: 0,
			results: [],
		});
		jest.mocked(ohgoService.getDangerousSlowdowns).mockResolvedValueOnce({
			links: [],
			totalPageCount: 1,
			totalResultCount: 0,
			currentResultCount: 0,
			results: [],
		});
		jest.mocked(ohgoService.getConstruction).mockResolvedValueOnce({
			links: [],
			totalPageCount: 1,
			totalResultCount: 0,
			currentResultCount: 0,
			results: [],
		});

		const result = await routeCheckService.checkRoute({
			startLat: 39.0,
			startLon: -83.0,
			endLat: 39.5,
			endLon: -83.0,
			bufferMiles: 0.5,
		});

		expect(result.success).toBe(true);
		expect(result.route.isEstimatedRoute).toBe(true);
		expect(result.isClear).toBe(true);
	});

	it("accepts custom polyline coordinates directly", async () => {
		jest.mocked(ohgoService.getIncidents).mockResolvedValueOnce({
			links: [],
			totalPageCount: 1,
			totalResultCount: 0,
			currentResultCount: 0,
			results: [],
		});
		jest.mocked(ohgoService.getDangerousSlowdowns).mockResolvedValueOnce({
			links: [],
			totalPageCount: 1,
			totalResultCount: 0,
			currentResultCount: 0,
			results: [],
		});
		jest.mocked(ohgoService.getConstruction).mockResolvedValueOnce({
			links: [],
			totalPageCount: 1,
			totalResultCount: 0,
			currentResultCount: 0,
			results: [],
		});

		const customCoords: [number, number][] = [
			[-84.5, 39.1],
			[-84.0, 39.5],
			[-83.5, 39.9],
		];

		const result = await routeCheckService.checkRoute({
			coordinates: customCoords,
			bufferMiles: 1.0,
		});

		expect(result.success).toBe(true);
		expect(result.isClear).toBe(true);
		expect(result.route.start.lat).toBe(39.1);
		expect(result.route.start.lon).toBe(-84.5);
		expect(result.route.end.lat).toBe(39.9);
		expect(result.route.end.lon).toBe(-83.5);
	});
});
