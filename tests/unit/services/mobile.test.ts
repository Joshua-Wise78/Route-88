import { describe, expect, it, jest } from "@jest/globals";
import { mobileService } from "../../../src/services/mobile";
import { ohgoService } from "../../../src/services/ohgo";
import {
	mockDangerousSlowdownListResponse,
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
});
