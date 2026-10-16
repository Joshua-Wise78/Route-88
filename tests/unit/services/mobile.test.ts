import { describe, expect, it, jest } from "@jest/globals";
import { mobileService } from "../../../src/services/mobile";
import { ohgoService } from "../../../src/services/ohgo";
import {
	mockConstructionListResponse,
	mockDangerousSlowdownListResponse,
	mockEmptyConstructionResponse,
	mockEmptyIncidentResponse,
	mockEmptySlowdownResponse,
	mockIncidentListResponse,
} from "../../fixtures";

jest.mock("../../../src/services/ohgo");

describe("mobileService", () => {
	// Incident tests
	describe("mobileService.getIncidents", () => {
		it("Query ohgoService to return incident data", async () => {
			jest
				.mocked(ohgoService.getIncidents)
				.mockResolvedValue(mockIncidentListResponse);

			const result = await mobileService.getIncidents({
				latitude: 39.96,
				longitude: -83.0,
				radiusMiles: 10,
			});

			expect(ohgoService.getIncidents).toHaveBeenCalledTimes(1);
			expect(result.results).toHaveLength(2);
			expect(result.results[0]?.id).toBe("inc-101");
		});

		it("Properly handles empty results as expected", async () => {
			jest
				.mocked(ohgoService.getIncidents)
				.mockResolvedValue(mockEmptyIncidentResponse);

			const result = await mobileService.getIncidents({ radiusMiles: 5 });

			expect(result.results).toEqual([]);
			expect(result.totalResultCount).toBe(0);
		});
	});

	// Slowdown tests
	describe("mobileService.getSlowdowns", () => {
		it("Queries ohgoService to return slowdown data", async () => {
			jest
				.mocked(ohgoService.getDangerousSlowdowns)
				.mockResolvedValue(mockDangerousSlowdownListResponse);

			const result = await mobileService.getSlowdowns({
				latitude: 39.96,
				longitude: -83.0,
				radiusMiles: 10,
			});

			expect(ohgoService.getDangerousSlowdowns).toHaveBeenCalledTimes(1);
			expect(result.results).toHaveLength(2);
			expect(result.results[0]?.id).toBe("slowdown-101");
		});

		it("Properly handles empty slowdown results as expected", async () => {
			jest
				.mocked(ohgoService.getDangerousSlowdowns)
				.mockResolvedValue(mockEmptySlowdownResponse);

			const result = await mobileService.getSlowdowns({
				latitude: 39.96,
				longitude: -83.0,
				radiusMiles: 10,
			});

			expect(ohgoService.getDangerousSlowdowns).toHaveBeenCalledTimes(1);
			expect(result.results).toEqual([]);
			expect(result.totalResultCount).toBe(0);
		});
	});

	// Construction tests
	describe("mobileService.getConstruction", () => {
		it("Queries ohgoService to return construction data", async () => {
			jest
				.mocked(ohgoService.getConstruction)
				.mockResolvedValue(mockConstructionListResponse);

			const result = await mobileService.getConstruction({
				latitude: 39.96,
				longitude: -83.0,
				radiusMiles: 10,
			});

			expect(ohgoService.getConstruction).toHaveBeenCalledTimes(1);
			expect(result.results).toHaveLength(2);
			expect(result.results[0]?.id).toBe("con-101");
		});

		it("Properly handles empty construction results as expected", async () => {
			jest
				.mocked(ohgoService.getConstruction)
				.mockResolvedValue(mockEmptyConstructionResponse);

			const result = await mobileService.getConstruction({
				latitude: 39.96,
				longitude: -83.0,
				radiusMiles: 10,
			});

			expect(ohgoService.getConstruction).toHaveBeenCalledTimes(1);
			expect(result.results).toEqual([]);
			expect(result.totalResultCount).toBe(0);
		});
	});

	// Generic Telemetry tests
	describe("mobileService.getGenericTelemetry", () => {
		it("Aggregates incidents, slowdowns, and construction into unified telemetry items", async () => {
			jest
				.mocked(ohgoService.getIncidents)
				.mockResolvedValue(mockIncidentListResponse);
			jest
				.mocked(ohgoService.getDangerousSlowdowns)
				.mockResolvedValue(mockDangerousSlowdownListResponse);
			jest
				.mocked(ohgoService.getConstruction)
				.mockResolvedValue(mockConstructionListResponse);

			const telemetry = await mobileService.getGenericTelemetry({
				latitude: 39.96,
				longitude: -83.0,
				radiusMiles: 10,
			});

			expect(ohgoService.getIncidents).toHaveBeenCalledTimes(1);
			expect(ohgoService.getDangerousSlowdowns).toHaveBeenCalledTimes(1);
			expect(ohgoService.getConstruction).toHaveBeenCalledTimes(1);

			expect(telemetry).toHaveLength(6);

			// Incident items
			expect(telemetry[0]).toEqual({
				id: "inc-inc-101",
				type: "incident",
				title: "Accident",
				description: "Right lane blocked due to collision",
				latitude: 39.9612,
				longitude: -82.9988,
			});
			expect(telemetry[1]?.type).toBe("incident");

			// Slowdown items
			expect(telemetry[2]).toEqual({
				id: "slow-slowdown-101",
				type: "slowdown",
				title: "Slowdown",
				description: "Slowdowns expected for 5 minutes.",
				latitude: 39.9612,
				longitude: -82.9988,
			});
			expect(telemetry[3]?.type).toBe("slowdown");

			// Construction items
			expect(telemetry[4]).toEqual({
				id: "const-con-101",
				type: "construction",
				title: "Roadwork",
				description: "Right lane closed for road construction and resurfacing",
				latitude: 39.9612,
				longitude: -82.9988,
				startTime: "2026-10-01T07:00:00Z",
			});
			expect(telemetry[5]?.type).toBe("construction");
		});

		it("Properly handles all empty responses as expected", async () => {
			jest
				.mocked(ohgoService.getIncidents)
				.mockResolvedValue(mockEmptyIncidentResponse);
			jest
				.mocked(ohgoService.getDangerousSlowdowns)
				.mockResolvedValue(mockEmptySlowdownResponse);
			jest
				.mocked(ohgoService.getConstruction)
				.mockResolvedValue(mockEmptyConstructionResponse);

			const telemetry = await mobileService.getGenericTelemetry({
				latitude: 39.96,
				longitude: -83.0,
				radiusMiles: 10,
			});

			expect(telemetry).toEqual([]);
		});

		it("Gracefully handles errors from individual OHGO services", async () => {
			jest
				.mocked(ohgoService.getIncidents)
				.mockResolvedValue(mockIncidentListResponse);
			jest
				.mocked(ohgoService.getDangerousSlowdowns)
				.mockRejectedValue(new Error("Slowdown API Error"));
			jest
				.mocked(ohgoService.getConstruction)
				.mockRejectedValue(new Error("Construction API Error"));

			const telemetry = await mobileService.getGenericTelemetry({
				latitude: 39.96,
				longitude: -83.0,
				radiusMiles: 10,
			});

			expect(telemetry).toHaveLength(2);
			expect(telemetry[0]?.id).toBe("inc-inc-101");
			expect(telemetry[1]?.id).toBe("inc-inc-102");
		});

		it("Falls back to location when description is missing and applies default titles", async () => {
			jest.mocked(ohgoService.getIncidents).mockResolvedValue({
				links: [],
				totalPageCount: 1,
				totalResultCount: 1,
				currentResultCount: 1,
				results: [
					{
						id: "no-desc-1",
						latitude: 39.96,
						longitude: -83.0,
						location: "Fallback Location",
						description: "",
						category: "",
						direction: "Eastbound",
						routeName: "I-70",
						links: [],
						roadStatus: "Restricted",
					},
				],
			});
			jest.mocked(ohgoService.getDangerousSlowdowns).mockResolvedValue({
				links: [],
				totalPageCount: 1,
				totalResultCount: 1,
				currentResultCount: 1,
				results: [
					{
						id: "no-desc-2",
						latitude: 39.96,
						longitude: -83.0,
						location: "Slowdown Location",
						description: "",
						category: "",
						direction: "Eastbound",
						routeName: "I-70",
						links: [],
						normalMPH: 65,
						currentMPH: 30,
					},
				],
			});
			jest.mocked(ohgoService.getConstruction).mockResolvedValue({
				links: [],
				totalPageCount: 1,
				totalResultCount: 1,
				currentResultCount: 1,
				results: [
					{
						id: "no-desc-3",
						latitude: 39.96,
						longitude: -83.0,
						location: "Construction Location",
						description: "",
						category: "",
						direction: "Eastbound",
						routeName: "I-70",
						links: [],
						status: "Active",
						district: "District 6",
						startDate: "2026-10-01T00:00:00Z",
						endDate: "2026-10-31T00:00:00Z",
					},
				],
			});

			const telemetry = await mobileService.getGenericTelemetry({
				latitude: 39.96,
				longitude: -83.0,
				radiusMiles: 10,
			});

			expect(telemetry).toHaveLength(3);
			expect(telemetry[0]).toEqual({
				id: "inc-no-desc-1",
				type: "incident",
				title: "Incident",
				description: "Fallback Location",
				latitude: 39.96,
				longitude: -83.0,
			});
			expect(telemetry[1]).toEqual({
				id: "slow-no-desc-2",
				type: "slowdown",
				title: "Dangerous Slowdown",
				description: "Slowdown Location",
				latitude: 39.96,
				longitude: -83.0,
			});
			expect(telemetry[2]).toEqual({
				id: "const-no-desc-3",
				type: "construction",
				title: "Construction",
				description: "Construction Location",
				latitude: 39.96,
				longitude: -83.0,
				startTime: "2026-10-01T00:00:00Z",
			});
		});
	});
});
