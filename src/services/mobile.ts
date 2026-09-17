import { ohgoService } from "./ohgo";
import {
	GenericTelemetry,
	LocationQuerySchema,
} from "../types/mobile/mobile";

export const mobileService = {
	async getGenericTelemetry(
		query: LocationQuerySchema,
	): Promise<GenericTelemetry[]> {
		const ohgoParams: Record<string, any> = { "page-all": true };

		if (query.latitude !== undefined && query.longitude !== undefined) {
			const offset = query.radiusMiles / 69.0;

			ohgoParams["map-bounds-sw"] =
				`${query.latitude - offset},${query.longitude - offset}`;

			ohgoParams["map-bounds-ne"] =
				`${query.latitude + offset},${query.longitude + offset}`;
		}

		const [incidents, slowdowns, construction] = await Promise.all([
			ohgoService.getIncidents(ohgoParams).catch(() => ({ results: [] })),
			ohgoService
				.getDangerousSlowdowns(ohgoParams)
				.catch(() => ({ results: [] })),
			ohgoService.getConstruction(ohgoParams).catch(() => ({ results: [] })),
		]);

		const telemetry: GenericTelemetry[] = [];

		incidents.results?.forEach((item) => {
			telemetry.push({
				id: `inc-${item.id}`,
				type: "incident",
				title: item.category || "Incident",
				description: item.description || item.location || "",
				latitude: item.latitude,
				longitude: item.longitude,
			});
		});

		slowdowns.results?.forEach((item) => {
			telemetry.push({
				id: `slow-${item.id}`,
				type: "slowdown",
				title: item.category || "Dangerous Slowdown",
				description: item.description || item.location || "",
				latitude: item.latitude,
				longitude: item.longitude,
			});
		});

		construction.results?.forEach((item) => {
			telemetry.push({
				id: `const-${item.id}`,
				type: "construction",
				title: item.category || "Construction",
				description: item.description || item.location || "",
				latitude: item.latitude,
				longitude: item.longitude,
				startTime: item.startDate,
			});
		});

		return telemetry;
	},
};
