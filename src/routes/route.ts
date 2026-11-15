import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { routeService } from "../services/osrm";
import { routeCheckService } from "../services/route-check";
import {
	AutocompleteQuerySchema,
	RouteQuerySchema,
} from "../types/mobile/mobile";
import { RouteCheckBodySchema, RouteCheckQuerySchema } from "../types/route";

const routeRouter = new Hono();

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
