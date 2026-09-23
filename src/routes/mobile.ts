import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { env } from "../config/env";
import { mobileService } from "../services/mobile";
import {
	DeviceIdentiySchema,
	LocationQuerySchema,
} from "../types/mobile/mobile";

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
	}
);

mobileRouter.get(
	"/slowdowns",
	zValidator("query", LocationQuerySchema),
	async (c) => {
		const query = c.req.valid("query");
		const data = await mobileService.getSlowdowns(query);
		return c.json(data);
	}
);

mobileRouter.get(
	"/construction",
	zValidator("query", LocationQuerySchema),
	async (c) => {
		const query = c.req.valid("query");
		const data = await mobileService.getConstruction(query);
		return c.json(data);
	}
);

export default mobileRouter;
