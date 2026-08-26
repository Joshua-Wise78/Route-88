import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { env } from "../config/env";
import { webhookService } from "../services/discord";
import { ohgoService } from "../services/ohgo";
import { ohgoQuerySchema } from "../utils/validators";

const discordRouter = new Hono();

discordRouter.use("/*", bearerAuth({ token: env.INTERNAL_API_KEY }));
const DEFAULT_PARAMS = { "page-all": true, region: "sw-ohio" };

discordRouter.get(
	"/incidents",
	zValidator("query", ohgoQuerySchema),
	async (c) => {
		try {
			const safeQuery = c.req.valid("query");
			const params = { ...DEFAULT_PARAMS, ...safeQuery } as any;
			const data = await ohgoService.getIncidents(params);

			return c.json(data);
		} catch (error) {
			console.error("Error fetching incidents:", error);
			return c.json({ error: "Failed to fetch incidents from OHGO" }, 500);
		}
	},
);

discordRouter.get(
	"/slowdowns",
	zValidator("query", ohgoQuerySchema),
	async (c) => {
		try {
			const safeQuery = c.req.valid("query");
			const params = { ...DEFAULT_PARAMS, ...safeQuery } as any;
			const data = await ohgoService.getDangerousSlowdowns(params);
			return c.json(data);
		} catch (error) {
			console.error("Error fetching slowdowns:", error);
			return c.json({ error: "Failed to fetch slowdowns from OHGO" }, 500);
		}
	},
);

discordRouter.get(
	"/construction",
	zValidator("query", ohgoQuerySchema),
	async (c) => {
		try {
			const safeQuery = c.req.valid("query");
			const params = { ...DEFAULT_PARAMS, ...safeQuery } as any;
			const data = await ohgoService.getConstruction(params);
			return c.json(data);
		} catch (error) {
			console.error("Error fetching construction:", error);
			return c.json({ error: "Failed to fetch construction from OHGO" }, 500);
		}
	},
);

discordRouter.get(
	"/daily-feed",
	zValidator("query", ohgoQuerySchema),
	async (c) => {
		const safeQuery = c.req.valid("query");
		const params = { ...DEFAULT_PARAMS, ...safeQuery } as any;

		// Fire and forget
		Promise.all([
			ohgoService.getConstruction(params),
			ohgoService.getDangerousSlowdowns(params),
		])
			.then(async ([construction, slowdowns]) => {
				await webhookService.sendDailyFeed(
					construction.results || [],
					slowdowns.results || [],
				);
			})
			.catch((error) => {
				console.error("Background daily feed processing failed:", error);
			});

		return c.json(
			{ message: "Daily feed processing started in the background." },
			202,
		);
	},
);

export default discordRouter;
