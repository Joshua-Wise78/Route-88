import { and, gte, lte } from "drizzle-orm";
import { db } from "../db";
import { roadEvents } from "../db/schema";
import type { Construction, DangerousSlowDown, Incident } from "../types/ohgo_types";
import type {
	HazardSeverity,
	RouteCheckBody,
	RouteCheckResult,
	RouteClearanceStatus,
	RouteHazard,
	RouteStepInfo,
} from "../types/route";
import {
	calculateBoundingBox,
	calculatePolylineDistanceMiles,
	haversineDistanceMiles,
	isPointInBoundingBox,
	pointToPolylineDistance,
} from "../utils/geo";
import { ohgoService } from "./ohgo";
import { routeService } from "./osrm";

export const routeCheckService = {
	/**
	 * Analyzes a route corridor against live and cached road hazards (incidents, slowdowns, construction).
	 */
	async checkRoute(input: RouteCheckBody): Promise<RouteCheckResult> {
		const bufferMiles = input.bufferMiles ?? 0.5;

		let polylineCoordinates: [number, number][];
		let totalDistanceMiles = 0;
		let totalDurationSeconds = 0;
		let startLocation: { lat: number; lon: number };
		let endLocation: { lat: number; lon: number };
		let isEstimatedRoute = false;
		let routeSteps: RouteStepInfo[] | undefined;
		let geometry:
			| {
					type: "LineString";
					coordinates: [number, number][];
			  }
			| undefined;

		// 1. Resolve Route Geometry & Steps
		if (input.coordinates && input.coordinates.length >= 2) {
			polylineCoordinates = input.coordinates;
			const firstCoord = polylineCoordinates[0]!;
			const lastCoord = polylineCoordinates[polylineCoordinates.length - 1]!;

			startLocation = { lat: firstCoord[1], lon: firstCoord[0] };
			endLocation = { lat: lastCoord[1], lon: lastCoord[0] };
			totalDistanceMiles =
				Math.round(calculatePolylineDistanceMiles(polylineCoordinates) * 10) / 10;
			// Estimate 45 mph baseline if duration not provided by router
			totalDurationSeconds = Math.round((totalDistanceMiles / 45) * 3600);
			geometry = {
				type: "LineString",
				coordinates: polylineCoordinates,
			};
			routeSteps = [
				{
					instruction: "Depart towards destination",
					distanceMeters: Math.round(totalDistanceMiles * 1609.344),
					durationSeconds: totalDurationSeconds,
					location: { lon: firstCoord[0], lat: firstCoord[1] },
					maneuverType: "depart",
				},
				{
					instruction: "Arrive at destination",
					distanceMeters: 0,
					durationSeconds: 0,
					location: { lon: lastCoord[0], lat: lastCoord[1] },
					maneuverType: "arrive",
				},
			];
		} else if (
			input.startLat !== undefined &&
			input.startLon !== undefined &&
			input.endLat !== undefined &&
			input.endLon !== undefined
		) {
			startLocation = { lat: input.startLat, lon: input.startLon };
			endLocation = { lat: input.endLat, lon: input.endLon };

			try {
				const routeData = await routeService.getRoute(
					input.startLat,
					input.startLon,
					input.endLat,
					input.endLon,
				);

				polylineCoordinates = routeData.geometry.coordinates;
				totalDistanceMiles =
					Math.round((routeData.distance / 1609.344) * 10) / 10;
				totalDurationSeconds = Math.round(routeData.duration);
				geometry = routeData.geometry;
				isEstimatedRoute = !!routeData.isEstimated;
				routeSteps = routeData.steps.map((s) => ({
					instruction: s.instruction,
					distanceMeters: s.distanceMeters ?? s.distancemeters,
					durationSeconds: s.durationSeconds,
					location: s.location,
					maneuverType: s.maneuverType ?? s.manueverType,
					...(s.maneuverModifier || s.manueverModifier
						? { maneuverModifier: s.maneuverModifier || s.manueverModifier }
						: {}),
				}));
			} catch (osrmError) {
				// Fallback to straight-line route corridor if OSRM is unreachable
				console.warn(
					"OSRM routing unavailable, using straight-line corridor fallback:",
					(osrmError as Error)?.message,
				);
				polylineCoordinates = [
					[input.startLon, input.startLat],
					[input.endLon, input.endLat],
				];
				totalDistanceMiles =
					Math.round(
						haversineDistanceMiles(
							input.startLat,
							input.startLon,
							input.endLat,
							input.endLon,
						) * 10,
					) / 10;
				totalDurationSeconds = Math.round((totalDistanceMiles / 45) * 3600);
				isEstimatedRoute = true;
				geometry = {
					type: "LineString",
					coordinates: polylineCoordinates,
				};
				routeSteps = [
					{
						instruction: "Depart towards destination",
						distanceMeters: Math.round(totalDistanceMiles * 1609.344),
						durationSeconds: totalDurationSeconds,
						location: { lon: input.startLon, lat: input.startLat },
						maneuverType: "depart",
					},
					{
						instruction: "Arrive at destination",
						distanceMeters: 0,
						durationSeconds: 0,
						location: { lon: input.endLon, lat: input.endLat },
						maneuverType: "arrive",
					},
				];
			}
		} else {
			throw new Error(
				"Insufficient route parameters. Provide start/end coordinates or a coordinates polyline.",
			);
		}

		// 2. Compute Corridor Bounding Box
		const bbox = calculateBoundingBox(polylineCoordinates, bufferMiles);

		// 3. Retrieve Live and DB Events
		const ohgoParams = {
			"map-bounds-sw": `${bbox.minLat},${bbox.minLon}`,
			"map-bounds-ne": `${bbox.maxLat},${bbox.maxLon}`,
			"page-all": true,
		};

		const [incidentsRes, slowdownsRes, constructionRes] = await Promise.all([
			ohgoService.getIncidents(ohgoParams).catch(() => ({ results: [] as Incident[] })),
			ohgoService.getDangerousSlowdowns(ohgoParams).catch(() => ({ results: [] as DangerousSlowDown[] })),
			ohgoService.getConstruction(ohgoParams).catch(() => ({ results: [] as Construction[] })),
		]);

		let incidents = incidentsRes.results || [];
		let slowdowns = slowdownsRes.results || [];
		let construction = constructionRes.results || [];

		// If external API returns nothing, check local roadEvents cache as fallback
		if (incidents.length === 0 && slowdowns.length === 0 && construction.length === 0) {
			try {
				const cached = await db
					.select()
					.from(roadEvents)
					.where(
						and(
							gte(roadEvents.latitude, bbox.minLat),
							lte(roadEvents.latitude, bbox.maxLat),
							gte(roadEvents.longitude, bbox.minLon),
							lte(roadEvents.longitude, bbox.maxLon),
						),
					);

				for (const item of cached) {
					const raw = item.rawPayload as any;
					if (item.eventType === "incident") {
						incidents.push(raw);
					} else if (item.eventType === "slowdown") {
						slowdowns.push(raw);
					} else if (item.eventType === "construction") {
						construction.push(raw);
					}
				}
			} catch {
				// Database fallback optional
			}
		}

		// 4. Correlate Events against Route Polyline
		const hazards: RouteHazard[] = [];
		const seenIds = new Set<string>();

		// Helper to process any event item
		const processEvent = (
			item: any,
			type: "incident" | "slowdown" | "construction",
		) => {
			if (!item || !item.id || seenIds.has(item.id)) return;
			if (typeof item.latitude !== "number" || typeof item.longitude !== "number") return;

			// Quick bbox check
			if (!isPointInBoundingBox(item.latitude, item.longitude, bbox)) return;

			// Accurate distance from route polyline
			const point = { lat: item.latitude, lon: item.longitude };
			const polyResult = pointToPolylineDistance(point, polylineCoordinates);

			if (polyResult.minDistanceMiles <= bufferMiles) {
				seenIds.add(item.id);

				const descLower = (item.description || "").toLowerCase();
				const statusLower = (item.roadStatus || "").toLowerCase();

				const isRoadClosed =
					statusLower.includes("close") ||
					descLower.includes("closed") ||
					descLower.includes("road closure") ||
					descLower.includes("all lanes blocked");

				let severity: HazardSeverity = "medium";
				if (isRoadClosed) {
					severity = "critical";
				} else if (type === "incident") {
					if (
						descLower.includes("fatal") ||
						descLower.includes("rollover") ||
						descLower.includes("injury")
					) {
						severity = "high";
					} else {
						severity = "medium";
					}
				} else if (type === "construction") {
					if (descLower.includes("lane closed") || descLower.includes("ramp closed")) {
						severity = "medium";
					} else {
						severity = "low";
					}
				} else if (type === "slowdown") {
					severity = "medium";
				}

				hazards.push({
					id: item.id,
					type,
					title: item.category || type.toUpperCase(),
					description: item.description || item.location || "No details provided",
					location: item.location || "",
					direction: item.direction,
					routeName: item.routeName,
					latitude: item.latitude,
					longitude: item.longitude,
					distanceFromRouteMiles:
						Math.round(polyResult.minDistanceMiles * 100) / 100,
					mileMarkerOnRoute:
						Math.round(polyResult.mileAlongRoute * 10) / 10,
					severity,
					isRoadClosed,
					rawPayload: item,
				});
			}
		};

		incidents.forEach((i) => processEvent(i, "incident"));
		slowdowns.forEach((s) => processEvent(s, "slowdown"));
		construction.forEach((c) => processEvent(c, "construction"));

		// 5. Order Hazards by Mile Marker along Route
		hazards.sort((a, b) => a.mileMarkerOnRoute - b.mileMarkerOnRoute);

		// 6. Compute Clearance Status & Summary
		const incidentsCount = hazards.filter((h) => h.type === "incident").length;
		const slowdownsCount = hazards.filter((h) => h.type === "slowdown").length;
		const constructionCount = hazards.filter((h) => h.type === "construction").length;
		const totalHazards = hazards.length;
		const isClear = totalHazards === 0;

		let status: RouteClearanceStatus = "clear";
		let message = "Route is clear! No active incidents, dangerous slowdowns, or construction detected along this corridor.";

		if (!isClear) {
			const hasClosure = hazards.some((h) => h.isRoadClosed);
			const hasCritical = hazards.some((h) => h.severity === "critical");

			if (hasClosure || hasCritical) {
				status = "severe_hazards";
				message = `CAUTION: Road closure or severe hazards detected on your route! (${totalHazards} total hazards)`;
			} else if (incidentsCount > 1 || totalHazards >= 3) {
				status = "moderate_hazards";
				message = `Moderate hazards along your route (${incidentsCount} incidents, ${slowdownsCount} slowdowns, ${constructionCount} construction zones).`;
			} else {
				status = "minor_delays";
				message = `Minor conditions detected along your route (${totalHazards} condition${totalHazards > 1 ? "s" : ""}).`;
			}
		}

		return {
			success: true,
			isClear,
			status,
			summary: {
				totalHazards,
				incidentsCount,
				slowdownsCount,
				constructionCount,
				message,
			},
			route: {
				totalDistanceMiles,
				totalDurationSeconds,
				start: startLocation,
				end: endLocation,
				isEstimatedRoute,
				geometry,
				steps: routeSteps,
			},
			corridorBufferMiles: bufferMiles,
			hazards,
		};
	},
};
