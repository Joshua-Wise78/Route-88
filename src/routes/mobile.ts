import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { env } from "../config/env";
import { mobileService } from "../services/mobile";
import { routeCheckService } from "../services/route-check";
import {
	DeviceIdentiySchema,
	LocationQuerySchema,
} from "../types/mobile/mobile";
import { RouteCheckBodySchema, RouteCheckQuerySchema } from "../types/route";

const mobileRouter = new Hono();

mobileRouter.use("/*", bearerAuth({ token: env.INTERNAL_API_KEY }));
const DEFAULT_PARAMS = { "page-all": true };

mobileRouter.get("/status", (c) => c.json({ status: "online", for: "mobile" }));

mobileRouter.post("/register", zValidator("json", DeviceIdentiySchema), (c) => {
	const data = c.req.valid("json");
	console.log(`Registered device ${data.deviceId}.`);
	return c.json({ success: true });
});

mobileRouter.get(
	"/telemetry",
	zValidator("query", LocationQuerySchema),
	async (c) => {
		const query = c.req.valid("query");
		const data = await mobileService.getGenericTelemetry(query);
		return c.json({ results: data });
	},
);

mobileRouter.get(
	"/incidents",
	zValidator("query", LocationQuerySchema),
	async (c) => {
		const query = c.req.valid("query");
		const data = await mobileService.getIncidents(query);
		return c.json(data);
	},
);

mobileRouter.get(
	"/slowdowns",
	zValidator("query", LocationQuerySchema),
	async (c) => {
		const query = c.req.valid("query");
		const data = await mobileService.getSlowdowns(query);
		return c.json(data);
	},
);

mobileRouter.get(
	"/construction",
	zValidator("query", LocationQuerySchema),
	async (c) => {
		const query = c.req.valid("query");
		const data = await mobileService.getConstruction(query);
		return c.json(data);
	},
);

// Mobile corridor hazard check
mobileRouter.get(
	"/route/check",
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

mobileRouter.post(
	"/route/check",
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

export default mobileRouter;
