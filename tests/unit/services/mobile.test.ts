import { describe, expect, it, jest } from "@jest/globals";
import { mobileService } from "../../../src/services/mobile";
import { ohgoService } from "../../../src/services/ohgo";
import {
	mockEmptyIncidentResponse,
	mockIncidentListResponse,
} from "../../fixtures";

jest.mock("../../../src/services/ohgo");

describe("mobileService.getIncidents", () => {
	it("queries ohgoService with bounding box and returns incident data", async () => {
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

	it("handles empty results cleanly", async () => {
		jest
			.mocked(ohgoService.getIncidents)
			.mockResolvedValue(mockEmptyIncidentResponse);

		const result = await mobileService.getIncidents({ radiusMiles: 5 });

		expect(result.results).toEqual([]);
		expect(result.totalResultCount).toBe(0);
	});
});
