import { Hono } from "hono";
import { ohgoService } from "../services/ohgo";
import { webhookService } from "../services/discord";

const discordRouter = new Hono();
const DEFAULT_PARAMS = { "page-all": true, region: "sw-ohio" };

discordRouter.get("/incidents", async (c) => {
	try {
		const params = { ...DEFAULT_PARAMS, ...c.req.query() };
		const data = await ohgoService.getIncidents(params);
		
		// Example background trigger
		if (data.results && data.results.length > 0) {
			webhookService.notifyNewIncident(data.results[0]).catch(err => 
				console.error("Background webhook failed:", err)
			);
		}

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
	const params = { ...DEFAULT_PARAMS, ...c.req.query() };

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
});

export default discordRouter;
