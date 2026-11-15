import { env } from "../config/env";
import { haversineDistanceMiles, METERS_PER_MILE } from "../utils/geo";

export interface RouteStep {
	instruction: string;
	distanceMeters: number;
	distancemeters: number; // legacy alias
	durationSeconds: number;
	location: {
		lon: number;
		lat: number;
	};
	maneuverType: string;
	manueverType: string; // legacy alias
	maneuverModifier?: string;
	manueverModifier?: string; // legacy alias
}

export interface RouteResult {
	distance: number;
	duration: number;
	geometry: {
		type: "LineString";
		coordinates: [number, number][];
	};
	startLocation: { lat: number; lon: number };
	endLocation: { lat: number; lon: number };
	endLocaiton: { lat: number; lon: number }; // legacy alias
	steps: RouteStep[];
	isEstimated?: boolean;
}

export const routeService = {
	async getRoute(
		startLat: number,
		startLon: number,
		endLat: number,
		endLon: number,
	): Promise<RouteResult> {
		const coordsString = `${startLon},${startLat};${endLon},${endLat}`;
		const baseOsrm = env.OSRM_URL.replace(/\/+$/, "");
		const osrmUrl = `${baseOsrm}/route/v1/driving/${coordsString}?overview=full&geometries=geojson&steps=true`;

		try {
			const osrmResponse = await fetch(osrmUrl);
			if (!osrmResponse.ok) {
				throw new Error(`OSRM responded with status ${osrmResponse.status}`);
			}
			const osrmData = (await osrmResponse.json()) as any;

			if (
				osrmData.code !== "Ok" ||
				!osrmData.routes ||
				osrmData.routes.length === 0
			) {
				throw new Error("Could not calculate a route between these locations.");
			}

			const route = osrmData.routes[0];
			const rawSteps = route.legs?.[0]?.steps || [];

			const turnByTurn: RouteStep[] = rawSteps.map((step: any) => {
				const type = step.maneuver.type;
				const modifier = step.maneuver.modifier
					? ` ${step.maneuver.modifier}`
					: "";

				const streetName = step.name ? ` onto ${step.name}` : "";

				const instruction =
					type === "arrive"
						? `Arrive at destination`
						: `${type}${modifier}${streetName}`;

				return {
					instruction: instruction,
					distanceMeters: step.distance,
					distancemeters: step.distance,
					durationSeconds: step.duration,
					location: {
						lon: step.maneuver.location[0],
						lat: step.maneuver.location[1],
					},
					maneuverType: type,
					manueverType: type,
					maneuverModifier: step.maneuver.modifier,
					manueverModifier: step.maneuver.modifier,
				};
			});

			return {
				distance: route.distance,
				duration: route.duration,
				geometry: route.geometry as {
					type: "LineString";
					coordinates: [number, number][];
				},
				startLocation: { lat: startLat, lon: startLon },
				endLocation: { lat: endLat, lon: endLon },
				endLocaiton: { lat: endLat, lon: endLon },
				steps: turnByTurn,
				isEstimated: false,
			};
		} catch (error) {
			console.warn(
				"OSRM routing unavailable, generating estimated fallback route:",
				(error as Error)?.message,
			);
			const distMiles = haversineDistanceMiles(
				startLat,
				startLon,
				endLat,
				endLon,
			);
			const distMeters = Math.round(distMiles * METERS_PER_MILE);
			const durationSec = Math.round((distMiles / 45) * 3600);

			const fallbackSteps: RouteStep[] = [
				{
					instruction: "Depart towards destination",
					distanceMeters: distMeters,
					distancemeters: distMeters,
					durationSeconds: durationSec,
					location: { lon: startLon, lat: startLat },
					maneuverType: "depart",
					manueverType: "depart",
				},
				{
					instruction: "Arrive at destination",
					distanceMeters: 0,
					distancemeters: 0,
					durationSeconds: 0,
					location: { lon: endLon, lat: endLat },
					maneuverType: "arrive",
					manueverType: "arrive",
				},
			];

			return {
				distance: distMeters,
				duration: durationSec,
				geometry: {
					type: "LineString",
					coordinates: [
						[startLon, startLat],
						[endLon, endLat],
					],
				},
				startLocation: { lat: startLat, lon: startLon },
				endLocation: { lat: endLat, lon: endLon },
				endLocaiton: { lat: endLat, lon: endLon },
				steps: fallbackSteps,
				isEstimated: true,
			};
		}
	},

	async autocompleteAddress(query: string) {
		const baseNominatim = env.NOMINATIM_URL.replace(/\/+$/, "");
		const url = new URL(`${baseNominatim}/search`);
		url.searchParams.set("q", query);
		url.searchParams.set("format", "json");
		url.searchParams.set("limit", "5");
		url.searchParams.set("addressdetails", "1");

		const response = await fetch(url.toString());
		const data = (await response.json()) as any[];

		return data.map((item: any) => ({
			id: item.place_id,
			displayName: item.display_name,
			lat: parseFloat(item.lat),
			lon: parseFloat(item.lon),
			street: item.address?.road || item.address?.predestrian,
			city: item.address?.city || item.address?.town || item.address?.village,
		}));
	},

	async geocodeAddress(address: string) {
		const baseNominatim = env.NOMINATIM_URL.replace(/\/+$/, "");
		const url = new URL(`${baseNominatim}/search`);
		url.searchParams.set("q", address);
		url.searchParams.set("format", "json");
		url.searchParams.set("limit", "1");

		const response = await fetch(url.toString());
		const data = (await response.json()) as any[];

		if (!data || data.length === 0) {
			throw new Error(`Address not found: ${address}`);
		}

		return {
			lat: parseFloat(data[0].lat),
			lon: parseFloat(data[0].lon),
			displayName: data[0].display_name,
		};
	},
};
