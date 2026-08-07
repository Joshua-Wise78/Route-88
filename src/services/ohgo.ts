import { env } from "../config/env";
import type {
	Construction,
	DangerousSlowDown,
	Incident,
	OhgoApiResponse,
	OhgoBaseParams,
	OhgoConstructionParams,
	WZDX_4_2,
} from "../types/ohgo_types";

const OHGO_BASE_URL = "https://publicapi.ohgo.com/api/v1";
const OHGO_WZDX_URL = "https://publicapi.ohgo.com/api/work-zones/wzdx/4.2";

/**
 * generic fetch ohgo function to retrieve data
 *
 * @param url - The base url for the api
 * @param params - The paramaters passed in based on the OhgoBaseParams
 */
async function fetchOhgo<T>(
	url: string,
	params?: Record<string, string | number | boolean>,
): Promise<T> {
	const urlObj = new URL(url);

	if (params) {
		Object.entries(params).forEach(([key, val]) => {
			if (val !== undefined && val !== null) {
				urlObj.searchParams.append(key, String(val));
			}
		});
	}

	const response = await fetch(urlObj.toString(), {
		method: "GET",
		headers: {
			Authorization: `APIKEY ${env.OHGO_API_KEY}`,
			Accept: "application/json",
		},
	});

	if (!response.ok) {
		const errorText = await response.text().catch(() => "Unknown error");
		throw new Error(
			`OHGO API Error (${response.status} ${response.statusText}: ${errorText})`,
		);
	}

	return (await response.json()) as T;
}

// Service for the Ohgo different routes
export const ohgoService = {
	/**
	 * Gathers incidents and allows for filtering
	 * @param params - The base params to filter down returned values
	 */
	async getIncidents(
		params?: OhgoBaseParams,
	): Promise<OhgoApiResponse<Incident>> {
		return fetchOhgo<OhgoApiResponse<Incident>>(
			`${OHGO_BASE_URL}/incidents`,
			params as Record<string, string | number | boolean>,
		);
	},

	/**
	 * Gathers dangeroSlowdown and allows for filtering
	 * @param params - The base params to filter down returned values
	 */
	async getDangerousSlowdowns(
		params?: OhgoBaseParams,
	): Promise<OhgoApiResponse<DangerousSlowDown>> {
		return fetchOhgo<OhgoApiResponse<DangerousSlowDown>>(
			`${OHGO_BASE_URL}/dangerous-slowdowns`,
			params as Record<string, string | number | boolean>,
		);
	},

	/**
	 * Gathers construction and allows for filtering
	 * @param params - The extended params for Construction
	 */
	async getConstruction(
		params?: OhgoConstructionParams,
	): Promise<OhgoApiResponse<Construction>> {
		return fetchOhgo<OhgoApiResponse<Construction>>(
			`${OHGO_BASE_URL}/construction`,
			params as Record<string, string | number | boolean>,
		);
	},

	/**
	 * Gathers WZDX feed based on a enum typing
	 */
	async getWzdxFeed(): Promise<WZDX_4_2> {
		return fetchOhgo<WZDX_4_2>(OHGO_WZDX_URL);
	},
};
