import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { env } from "../../../src/config/env";
import { ohgoService } from "../../../src/services/ohgo";
import {
	mockConstructionListResponse,
	mockDangerousSlowdownListResponse,
	mockIncidentListResponse,
	mockWzdxFeedResponse,
} from "../../fixtures";

describe("ohgoService", () => {
	const originalFetch = global.fetch;
	let mockFetch: jest.Mock<(...args: any[]) => Promise<Response>>;

	beforeEach(() => {
		mockFetch = jest.fn();
		global.fetch = mockFetch as unknown as typeof fetch;
	});

	afterEach(() => {
		global.fetch = originalFetch;
		jest.restoreAllMocks();
	});

	const createMockResponse = (
		body: any,
		options: {
			ok?: boolean;
			status?: number;
			statusText?: string;
			textError?: boolean;
		} = {},
	) => {
		const {
			ok = true,
			status = 200,
			statusText = "OK",
			textError = false,
		} = options;

		return {
			ok,
			status,
			statusText,
			json: async () => body,
			text: textError
				? async () => {
						throw new Error("Text read failed");
					}
				: async () => (typeof body === "string" ? body : JSON.stringify(body)),
		} as unknown as Response;
	};

	describe("ohgoService.getIncidents", () => {
		it("Fetches incidents with query params and authorization headers", async () => {
			mockFetch.mockResolvedValueOnce(
				createMockResponse(mockIncidentListResponse),
			);

			const result = await ohgoService.getIncidents({
				region: "sw-ohio",
				"page-all": true,
				radius: undefined as any,
				page: null as any,
			});

			expect(mockFetch).toHaveBeenCalledTimes(1);
			const [urlArg, optionsArg] = mockFetch.mock.calls[0]!;

			const url = new URL(urlArg as string);
			expect(url.origin + url.pathname).toBe(
				"https://publicapi.ohgo.com/api/v1/incidents",
			);
			expect(url.searchParams.get("region")).toBe("sw-ohio");
			expect(url.searchParams.get("page-all")).toBe("true");
			expect(url.searchParams.has("radius")).toBe(false);
			expect(url.searchParams.has("page")).toBe(false);

			expect(optionsArg).toEqual({
				method: "GET",
				headers: {
					Authorization: `APIKEY ${env.OHGO_API_KEY}`,
					Accept: "application/json",
				},
			});

			expect(result).toEqual(mockIncidentListResponse);
		});

		it("Fetches incidents without params", async () => {
			mockFetch.mockResolvedValueOnce(
				createMockResponse(mockIncidentListResponse),
			);

			const result = await ohgoService.getIncidents();

			expect(mockFetch).toHaveBeenCalledTimes(1);
			const [urlArg] = mockFetch.mock.calls[0]!;
			expect(urlArg).toBe("https://publicapi.ohgo.com/api/v1/incidents");
			expect(result).toEqual(mockIncidentListResponse);
		});
	});

	describe("ohgoService.getDangerousSlowdowns", () => {
		it("Fetches dangerous slowdowns with params", async () => {
			mockFetch.mockResolvedValueOnce(
				createMockResponse(mockDangerousSlowdownListResponse),
			);

			const result = await ohgoService.getDangerousSlowdowns({
				region: "columbus",
			});

			expect(mockFetch).toHaveBeenCalledTimes(1);
			const [urlArg, optionsArg] = mockFetch.mock.calls[0]!;

			const url = new URL(urlArg as string);
			expect(url.origin + url.pathname).toBe(
				"https://publicapi.ohgo.com/api/v1/dangerous-slowdowns",
			);
			expect(url.searchParams.get("region")).toBe("columbus");
			expect(optionsArg?.headers).toEqual({
				Authorization: `APIKEY ${env.OHGO_API_KEY}`,
				Accept: "application/json",
			});

			expect(result).toEqual(mockDangerousSlowdownListResponse);
		});

		it("Fetches dangerous slowdowns without params", async () => {
			mockFetch.mockResolvedValueOnce(
				createMockResponse(mockDangerousSlowdownListResponse),
			);

			const result = await ohgoService.getDangerousSlowdowns();

			expect(mockFetch).toHaveBeenCalledTimes(1);
			const [urlArg] = mockFetch.mock.calls[0]!;
			expect(urlArg).toBe(
				"https://publicapi.ohgo.com/api/v1/dangerous-slowdowns",
			);
			expect(result).toEqual(mockDangerousSlowdownListResponse);
		});
	});

	describe("ohgoService.getConstruction", () => {
		it("Fetches construction with extended params", async () => {
			mockFetch.mockResolvedValueOnce(
				createMockResponse(mockConstructionListResponse),
			);

			const result = await ohgoService.getConstruction({
				region: "sw-ohio",
				"include-future": "true",
			});

			expect(mockFetch).toHaveBeenCalledTimes(1);
			const [urlArg, optionsArg] = mockFetch.mock.calls[0]!;

			const url = new URL(urlArg as string);
			expect(url.origin + url.pathname).toBe(
				"https://publicapi.ohgo.com/api/v1/construction",
			);
			expect(url.searchParams.get("region")).toBe("sw-ohio");
			expect(url.searchParams.get("include-future")).toBe("true");
			expect(optionsArg?.headers).toEqual({
				Authorization: `APIKEY ${env.OHGO_API_KEY}`,
				Accept: "application/json",
			});

			expect(result).toEqual(mockConstructionListResponse);
		});

		it("Fetches construction without params", async () => {
			mockFetch.mockResolvedValueOnce(
				createMockResponse(mockConstructionListResponse),
			);

			const result = await ohgoService.getConstruction();

			expect(mockFetch).toHaveBeenCalledTimes(1);
			const [urlArg] = mockFetch.mock.calls[0]!;
			expect(urlArg).toBe("https://publicapi.ohgo.com/api/v1/construction");
			expect(result).toEqual(mockConstructionListResponse);
		});
	});

	describe("ohgoService.getWzdxFeed", () => {
		it("Fetches WZDx 4.2 feed from work-zones URL", async () => {
			mockFetch.mockResolvedValueOnce(
				createMockResponse(mockWzdxFeedResponse),
			);

			const result = await ohgoService.getWzdxFeed();

			expect(mockFetch).toHaveBeenCalledTimes(1);
			const [urlArg, optionsArg] = mockFetch.mock.calls[0]!;

			expect(urlArg).toBe(
				"https://publicapi.ohgo.com/api/work-zones/wzdx/4.2",
			);
			expect(optionsArg).toEqual({
				method: "GET",
				headers: {
					Authorization: `APIKEY ${env.OHGO_API_KEY}`,
					Accept: "application/json",
				},
			});

			expect(result).toEqual(mockWzdxFeedResponse);
		});
	});

	describe("Error handling in fetchOhgo", () => {
		it("Throws a formatted error when response is not ok", async () => {
			mockFetch.mockResolvedValueOnce(
				createMockResponse("Rate limit exceeded", {
					ok: false,
					status: 429,
					statusText: "Too Many Requests",
				}),
			);

			await expect(ohgoService.getIncidents()).rejects.toThrow(
				"OHGO API Error (429 Too Many Requests: Rate limit exceeded)",
			);
		});

		it("Falls back to 'Unknown error' if response.text() fails", async () => {
			mockFetch.mockResolvedValueOnce(
				createMockResponse("", {
					ok: false,
					status: 502,
					statusText: "Bad Gateway",
					textError: true,
				}),
			);

			await expect(ohgoService.getIncidents()).rejects.toThrow(
				"OHGO API Error (502 Bad Gateway: Unknown error)",
			);
		});
	});
});
