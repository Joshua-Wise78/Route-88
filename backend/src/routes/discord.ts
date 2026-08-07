import { Hono } from "hono";
import { ohgoService } from "../services/ohgo";

const discordRouter = new Hono();
const DEFAULT_PARAMS = { "page-all": true, region: "sw-ohio" };

discordRouter.get("/incidents", async (c) => {
	try {
		const params = { ...DEFAULT_PARAMS, ...c.req.query() };
		const data = await ohgoService.getIncidents(params);
		return c.json(data);
	} catch (error) {
		console.error("Error fetching incidents:", error);
		return c.json({ error: "Failed to fetch incidents from OHGO" }, 500);
	}
});

discordRouter.get("/slowdowns", async (c) => {
	try {
		const params = { ...DEFAULT_PARAMS, ...c.req.query() };
		const data = await ohgoService.getDangerousSlowdowns(params);
		return c.json(data);
	} catch (error) {
		console.error("Error fetching slowdowns:", error);
		return c.json({ error: "Failed to fetch slowdowns from OHGO" }, 500);
	}
});

discordRouter.get("/construction", async (c) => {
	try {
		const params = { ...DEFAULT_PARAMS, ...c.req.query() };
		const data = await ohgoService.getConstruction(params);
		return c.json(data);
	} catch (error) {
		console.error("Error fetching construction:", error);
		return c.json({ error: "Failed to fetch construction from OHGO" }, 500);
	}
});

discordRouter.get("/daily-feed", async (c) => {
	try {
		const params = { ...DEFAULT_PARAMS, ...c.req.query() };
		// Daily feed needs construction and recent slowdowns
		const [construction, slowdowns] = await Promise.all([
			ohgoService.getConstruction(params),
			ohgoService.getDangerousSlowdowns(params),
		]);

		return c.json({
			construction: construction.results || [],
			slowdowns: slowdowns.results || [],
		});
	} catch (error) {
		console.error("Error fetching daily feed data:", error);
		return c.json({ error: "Failed to fetch daily feed from OHGO" }, 500);
	}
});

export default discordRouter;
