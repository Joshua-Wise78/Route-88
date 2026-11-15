import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { mobileService } from "../services/mobile";
import { routeService } from "../services/osrm";
import { routeCheckService } from "../services/route-check";
import {
	AutocompleteQuerySchema,
	LocationQuerySchema,
	RouteQuerySchema,
} from "../types/mobile/mobile";
import { RouteCheckBodySchema, RouteCheckQuerySchema } from "../types/route";

const routeRouter = new Hono();

// Turn-by-Turn Route Calculation
routeRouter.get(
	"/calculate",
	zValidator("query", RouteQuerySchema),
	async (c) => {
		try {
			const query = c.req.valid("query");
			const routeData = await routeService.getRoute(
				query.startLat,
				query.startLon,
				query.endLat,
				query.endLon,
			);
			return c.json({ success: true, route: routeData });
		} catch (error: any) {
			return c.json({ success: false, error: error.message }, 400);
		}
	},
);

routeRouter.get(
	"calculate",
	zValidator("query", RouteQuerySchema),
	async (c) => {
		try {
			const query = c.req.valid("query");
			const routeData = await routeService.getRoute(
				query.startLat,
				query.startLon,
				query.endLat,
				query.endLon,
			);
			return c.json({ success: true, route: routeData });
		} catch (error: any) {
			return c.json({ success: false, error: error.message }, 400);
		}
	},
);

// Public location-based map events around user's coordinates
routeRouter.get(
	"/events",
	zValidator("query", LocationQuerySchema),
	async (c) => {
		try {
			const query = c.req.valid("query");
			const data = await mobileService.getGenericTelemetry(query);
			return c.json({ success: true, count: data.length, results: data });
		} catch (error: any) {
			return c.json({ success: false, error: error.message }, 500);
		}
	},
);

// GeoJSON FeatureCollection format for direct map rendering in Mapbox/MapLibre/Leaflet
routeRouter.get(
	"/events/geojson",
	zValidator("query", LocationQuerySchema),
	async (c) => {
		try {
			const query = c.req.valid("query");
			const data = await mobileService.getGenericTelemetry(query);
			const geojson = {
				type: "FeatureCollection",
				features: data.map((item) => ({
					type: "Feature",
					geometry: {
						type: "Point",
						coordinates: [item.longitude, item.latitude],
					},
					properties: {
						id: item.id,
						type: item.type,
						title: item.title,
						description: item.description,
						severity: item.severity,
						startTime: item.startTime,
					},
				})),
			};
			return c.json(geojson);
		} catch (error: any) {
			return c.json({ success: false, error: error.message }, 500);
		}
	},
);

// Route Clearance & Hazard Check
routeRouter.get(
	"/check",
	zValidator("query", RouteCheckQuerySchema),
	async (c) => {
		try {
			const query = c.req.valid("query");
			const result = await routeCheckService.checkRoute(query);
			return c.json(result);
		} catch (error: any) {
			return c.json({ success: false, error: error.message }, 400);
		}
	},
);

routeRouter.get(
	"/is-clear",
	zValidator("query", RouteCheckQuerySchema),
	async (c) => {
		try {
			const query = c.req.valid("query");
			const result = await routeCheckService.checkRoute(query);
			return c.json(result);
		} catch (error: any) {
			return c.json({ success: false, error: error.message }, 400);
		}
	},
);

routeRouter.post(
	"/check",
	zValidator("json", RouteCheckBodySchema),
	async (c) => {
		try {
			const body = c.req.valid("json");
			const result = await routeCheckService.checkRoute(body);
			return c.json(result);
		} catch (error: any) {
			return c.json({ success: false, error: error.message }, 400);
		}
	},
);

routeRouter.get(
	"/autocomplete",
	zValidator("query", AutocompleteQuerySchema),
	async (c) => {
		try {
			const { query } = c.req.valid("query");
			const suggestions = await routeService.autocompleteAddress(query);
			return c.json({ success: true, results: suggestions });
		} catch (error: any) {
			return c.json({ success: false, error: error.message }, 400);
		}
	},
);

export default routeRouter;
