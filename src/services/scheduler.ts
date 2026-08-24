import { Cron } from "croner";
import { inArray } from "drizzle-orm";
import { db } from "../db";
import { roadEvents } from "../db/schema";
import { webhookService } from "./discord";
import { ohgoService } from "./ohgo";

export function startScheduler() {
	console.log("Background Scheduler Started");

	const DEFAULT_PARAMS = { "page-all": true, region: "sw-ohio" };

	new Cron("*/10 * * * *", { protect: true }, async () => {
		console.log("Polling OHGO for new incidents...");
		try {
			const data = await ohgoService.getIncidents(DEFAULT_PARAMS);
			const incidents = data.results || [];

			if (incidents.length === 0) return;

			const ids = incidents.map((i) => i.id);
			const existing = await db
				.select({ id: roadEvents.id })
				.from(roadEvents)
				.where(inArray(roadEvents.id, ids));

			const existingIds = new Set(existing.map((e) => e.id));

			// Filter down to only BRAND NEW incidents and deduplicate within the same batch
			const processedIds = new Set<string>();
			const newIncidents = incidents.filter((i) => {
				if (existingIds.has(i.id) || processedIds.has(i.id)) return false;
				processedIds.add(i.id);
				return true;
			});

			for (const incident of newIncidents) {
				await webhookService.notifyNewIncident(incident);

				await db
					.insert(roadEvents)
					.values({
						id: incident.id,
						eventType: "incident",
						location: incident.location || "",
						description: incident.description || "",
						latitude: incident.latitude || 0,
						longitude: incident.longitude || 0,
						rawPayload: incident,
					})
					.onConflictDoNothing();
			}

			if (newIncidents.length > 0) {
				console.log(`Pushed ${newIncidents.length} new incidents to Discord!`);
			}
		} catch (error) {
			console.error("Incident polling failed:", error);
		}
	});

	new Cron("*/10 * * * *", { protect: true }, async () => {
		console.log("Polling OHGO for new slowdowns...");
		try {
			const data = await ohgoService.getDangerousSlowdowns(DEFAULT_PARAMS);
			const slowdowns = data.results || [];

			if (slowdowns.length === 0) return;

			const ids = slowdowns.map((s) => s.id);
			const existing = await db
				.select({ id: roadEvents.id })
				.from(roadEvents)
				.where(inArray(roadEvents.id, ids));

			const existingIds = new Set(existing.map((e) => e.id));

			const processedIds = new Set<string>();
			const newSlowdowns = slowdowns.filter((s) => {
				if (existingIds.has(s.id) || processedIds.has(s.id)) return false;
				processedIds.add(s.id);
				return true;
			});

			for (const slowdown of newSlowdowns) {
				await webhookService.notifyNewSlowdown(slowdown);

				await db
					.insert(roadEvents)
					.values({
						id: slowdown.id,
						eventType: "slowdown",
						location: slowdown.location || "",
						description: slowdown.description || "",
						latitude: slowdown.latitude || 0,
						longitude: slowdown.longitude || 0,
						rawPayload: slowdown,
					})
					.onConflictDoNothing();
			}

			if (newSlowdowns.length > 0) {
				console.log(`Pushed ${newSlowdowns.length} new slowdowns to Discord!`);
			}
		} catch (error) {
			console.error("Slowdown polling failed:", error);
		}
	});

	new Cron(
		"0 8 * * *",
		{ timezone: "America/New_York", protect: true },
		async () => {
			console.log("Running 8AM Daily Feed...");
			try {
				const [construction, slowdowns] = await Promise.all([
					ohgoService.getConstruction(DEFAULT_PARAMS),
					ohgoService.getDangerousSlowdowns(DEFAULT_PARAMS),
				]);

				await webhookService.sendDailyFeed(
					construction.results || [],
					slowdowns.results || [],
				);
			} catch (error) {
				console.error("Daily feed failed:", error);
			}
		},
	);
}
