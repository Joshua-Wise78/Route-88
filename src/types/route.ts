import { z } from "zod";

export const RouteCheckQuerySchema = z.object({
	startLat: z.coerce.number().min(-90).max(90),
	startLon: z.coerce.number().min(-180).max(180),
	endLat: z.coerce.number().min(-90).max(90),
	endLon: z.coerce.number().min(-180).max(180),
	bufferMiles: z.coerce.number().positive().max(25).default(0.5),
});

export const RouteCheckBodySchema = z
	.object({
		startLat: z.number().min(-90).max(90).optional(),
		startLon: z.number().min(-180).max(180).optional(),
		endLat: z.number().min(-90).max(90).optional(),
		endLon: z.number().min(-180).max(180).optional(),
		// Custom route geometry (GeoJSON coordinates: [longitude, latitude][])
		coordinates: z.array(z.tuple([z.number(), z.number()])).min(2).optional(),
		bufferMiles: z.number().positive().max(25).default(0.5),
	})
	.refine(
		(data) =>
			(data.coordinates && data.coordinates.length >= 2) ||
			(data.startLat !== undefined &&
				data.startLon !== undefined &&
				data.endLat !== undefined &&
				data.endLon !== undefined),
		{
			message:
				"Either provide startLat/startLon and endLat/endLon, or a coordinates array with at least 2 points.",
		},
	);

export type RouteCheckQuery = z.infer<typeof RouteCheckQuerySchema>;
export type RouteCheckBody = z.infer<typeof RouteCheckBodySchema>;

export type HazardSeverity = "low" | "medium" | "high" | "critical";

export interface RouteHazard {
	id: string;
	type: "incident" | "slowdown" | "construction";
	title: string;
	description: string;
	location: string;
	direction?: string;
	routeName?: string;
	latitude: number;
	longitude: number;
	distanceFromRouteMiles: number; // perpendicular distance from route line
	mileMarkerOnRoute: number; // distance in miles from the trip start
	severity: HazardSeverity;
	isRoadClosed: boolean;
	rawPayload?: unknown;
}

export type RouteClearanceStatus =
	| "clear"
	| "minor_delays"
	| "moderate_hazards"
	| "severe_hazards";

export interface RouteCheckSummary {
	totalHazards: number;
	incidentsCount: number;
	slowdownsCount: number;
	constructionCount: number;
	message: string;
}

export interface RouteStepInfo {
	instruction: string;
	distanceMeters: number;
	durationSeconds: number;
	location: {
		lon: number;
		lat: number;
	};
	maneuverType: string;
	maneuverModifier?: string;
}

export interface RouteCheckResult {
	success: boolean;
	isClear: boolean;
	status: RouteClearanceStatus;
	summary: RouteCheckSummary;
	route: {
		totalDistanceMiles: number;
		totalDurationSeconds: number;
		start: { lat: number; lon: number };
		end: { lat: number; lon: number };
		isEstimatedRoute: boolean;
		geometry?: {
			type: "LineString";
			coordinates: [number, number][];
		};
		steps?: RouteStepInfo[];
	};
	corridorBufferMiles: number;
	hazards: RouteHazard[];
}
