import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { env } from "../config/env";
import { ohgoService } from "../services/ohgo";
import { DeviceIdentiySchema } from "../types/mobile/mobile";

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
