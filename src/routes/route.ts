import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { env } from "../config/env";
import {
	AutocompleteQuerySchema,
	RouteQuerySchema,
} from "../types/mobile/mobile";
import { routeService } from "../services/osrm";

const routeRouter = new Hono();

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
