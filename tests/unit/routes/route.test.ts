import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { Hono } from "hono";
import routeRouter from "../../../src/routes/route";
import { routeService } from "../../../src/services/osrm";
import { routeCheckService } from "../../../src/services/route-check";

jest.mock("../../../src/services/osrm");
jest.mock("../../../src/services/route-check");

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
				endLocaiton: { lat: 39, lon: -83 },
				steps: [],
			});

			const res = await app.request(
				"/api/route/calculate?startLat=39.0&startLon=-84.0&endLat=39.0&endLon=-83.0",
			);

			expect(res.status).toBe(200);
			const data = (await res.json()) as any;
			expect(data.success).toBe(true);
			expect(data.route.distance).toBe(1000);
		});

		it("returns 400 when coordinates are invalid", async () => {
			const res = await app.request("/api/route/calculate?startLat=999");
			expect(res.status).toBe(400);
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
