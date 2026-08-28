import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { env } from "../config/env";
import { ohgoService } from "../services/ohgo";
import {
	DeviceIdentiySchema,
	LocationQuerySchema,
} from "../types/mobile/mobile";

/*
 * Todo:
 *    1. Need to setup either JWT or some better bearerAuth
 *    2. Status checker for mobile side.
 *
 **/

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
	"/incidents",
	zValidator("query", LocationQuerySchema),
	async (c) => {
		const query = c.req.valid("query");

		const ohgoParams: Record<string, any> = {
			"page-all": true,
		};

		if (query.latitude !== undefined && query.longitude !== undefined) {
			const offset = query.radiusMiles / 69.0;

			ohgoParams["map-bounds-sw"] =
				`${query.latitude - offset},${query.longitude - offset}`;
			ohgoParams["map-bounds-ne"] =
				`${query.latitude - offset},${query.longitude - offset}`;
		}

		const data = await ohgoService.getIncidents(ohgoParams);
		return c.json(data);
	},
);
