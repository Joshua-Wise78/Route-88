import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { Hono } from "hono";
import routeRouter from "../../../src/routes/route";
import { mobileService } from "../../../src/services/mobile";
import { routeService } from "../../../src/services/osrm";
import { routeCheckService } from "../../../src/services/route-check";

jest.mock("../../../src/services/osrm");
jest.mock("../../../src/services/route-check");
jest.mock("../../../src/services/mobile");

describe("Route API Endpoints (route.ts)", () => {
	let app: Hono;

	beforeEach(() => {
		jest.clearAllMocks();
		app = new Hono();
		app.route("/api/route", routeRouter);
	});

	describe("GET /api/route/calculate", () => {
		it("calculates turn-by-turn route via OSRM service", async () => {
			jest.mocked(routeService.getRoute).mockResolvedValueOnce({
				distance: 1000,
				duration: 120,
				geometry: { type: "LineString", coordinates: [[-84, 39], [-83, 39]] },
				startLocation: { lat: 39, lon: -84 },
				endLocation: { lat: 39, lon: -83 },
				endLocaiton: { lat: 39, lon: -83 },
				steps: [
					{
						instruction: "Depart towards destination",
						distanceMeters: 1000,
						distancemeters: 1000,
						durationSeconds: 120,
						location: { lon: -84, lat: 39 },
						maneuverType: "depart",
						manueverType: "depart",
					},
				],
			});

			const res = await app.request(
				"/api/route/calculate?startLat=39.0&startLon=-84.0&endLat=39.0&endLon=-83.0",
			);

			expect(res.status).toBe(200);
			const data = (await res.json()) as any;
			expect(data.success).toBe(true);
			expect(data.route.distance).toBe(1000);
			expect(data.route.endLocation).toEqual({ lat: 39, lon: -83 });
			expect(data.route.steps[0].distanceMeters).toBe(1000);
		});

		it("returns 400 when coordinates are invalid", async () => {
			const res = await app.request("/api/route/calculate?startLat=999");
			expect(res.status).toBe(400);
		});
	});

	describe("GET /api/route/events and /api/route/events/geojson", () => {
		it("returns location-based road events near the user without requiring authentication", async () => {
			jest.mocked(mobileService.getGenericTelemetry).mockResolvedValueOnce([
				{
					id: "inc-1",
					type: "incident",
					title: "Crash",
					description: "Shoulder blocked",
					latitude: 39.96,
					longitude: -83.0,
				},
			]);

			const res = await app.request("/api/route/events?latitude=39.96&longitude=-83.0&radiusMiles=10");
			expect(res.status).toBe(200);
			const data = (await res.json()) as any;
			expect(data.success).toBe(true);
			expect(data.count).toBe(1);
			expect(data.results[0].id).toBe("inc-1");
		});

		it("returns GeoJSON FeatureCollection for direct map consumption", async () => {
			jest.mocked(mobileService.getGenericTelemetry).mockResolvedValueOnce([
				{
					id: "inc-1",
					type: "incident",
					title: "Crash",
					description: "Shoulder blocked",
					latitude: 39.96,
					longitude: -83.0,
				},
			]);

			const res = await app.request("/api/route/events/geojson?latitude=39.96&longitude=-83.0");
			expect(res.status).toBe(200);
			const data = (await res.json()) as any;
			expect(data.type).toBe("FeatureCollection");
			expect(data.features).toHaveLength(1);
			expect(data.features[0].geometry.type).toBe("Point");
			expect(data.features[0].geometry.coordinates).toEqual([-83.0, 39.96]);
			expect(data.features[0].properties.id).toBe("inc-1");
		});
	});

	describe("GET /api/route/check and /api/route/is-clear", () => {
		it("calls routeCheckService and returns clearance response for GET /check", async () => {
			jest.mocked(routeCheckService.checkRoute).mockResolvedValueOnce({
				success: true,
				isClear: true,
				status: "clear",
				summary: {
					totalHazards: 0,
					incidentsCount: 0,
					slowdownsCount: 0,
					constructionCount: 0,
					message: "Route is clear!",
				},
				route: {
					totalDistanceMiles: 50,
					totalDurationSeconds: 3600,
					start: { lat: 39, lon: -84 },
					end: { lat: 39, lon: -83 },
					isEstimatedRoute: false,
					steps: [],
				},
				corridorBufferMiles: 0.5,
				hazards: [],
			});

			const res = await app.request(
				"/api/route/check?startLat=39.0&startLon=-84.0&endLat=39.0&endLon=-83.0&bufferMiles=0.5",
			);

			expect(res.status).toBe(200);
			const data = (await res.json()) as any;
			expect(data.isClear).toBe(true);
			expect(data.status).toBe("clear");
			expect(routeCheckService.checkRoute).toHaveBeenCalledWith(
				expect.objectContaining({
					startLat: 39,
					startLon: -84,
					endLat: 39,
					endLon: -83,
					bufferMiles: 0.5,
				}),
			);
		});

		it("supports GET /api/route/is-clear alias", async () => {
			jest.mocked(routeCheckService.checkRoute).mockResolvedValueOnce({
				success: true,
				isClear: true,
				status: "clear",
				summary: {
					totalHazards: 0,
					incidentsCount: 0,
					slowdownsCount: 0,
					constructionCount: 0,
					message: "Route is clear!",
				},
				route: {
					totalDistanceMiles: 50,
					totalDurationSeconds: 3600,
					start: { lat: 39, lon: -84 },
					end: { lat: 39, lon: -83 },
					isEstimatedRoute: false,
					steps: [],
				},
				corridorBufferMiles: 0.5,
				hazards: [],
			});

			const res = await app.request(
				"/api/route/is-clear?startLat=39.0&startLon=-84.0&endLat=39.0&endLon=-83.0",
			);

			expect(res.status).toBe(200);
			const data = (await res.json()) as any;
			expect(data.isClear).toBe(true);
		});
	});

	describe("POST /api/route/check", () => {
		it("handles custom coordinates polyline in JSON body", async () => {
			jest.mocked(routeCheckService.checkRoute).mockResolvedValueOnce({
				success: true,
				isClear: true,
				status: "clear",
				summary: {
					totalHazards: 0,
					incidentsCount: 0,
					slowdownsCount: 0,
					constructionCount: 0,
					message: "Route is clear!",
				},
				route: {
					totalDistanceMiles: 50,
					totalDurationSeconds: 3600,
					start: { lat: 39, lon: -84 },
					end: { lat: 39, lon: -83 },
					isEstimatedRoute: false,
					steps: [],
				},
				corridorBufferMiles: 1.0,
				hazards: [],
			});

			const res = await app.request("/api/route/check", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					coordinates: [
						[-84.0, 39.0],
						[-83.0, 39.0],
					],
					bufferMiles: 1.0,
				}),
			});

			expect(res.status).toBe(200);
			expect(routeCheckService.checkRoute).toHaveBeenCalledWith(
				expect.objectContaining({
					coordinates: [
						[-84.0, 39.0],
						[-83.0, 39.0],
					],
					bufferMiles: 1.0,
				}),
			);
		});
	});
});
