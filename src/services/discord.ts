import { env } from "../config/env";
import {
	type DiscordEmbed,
	type DiscordWebhookPayload,
	DiscordColors,
} from "../types/discord";
import type {
	Incident,
	Construction,
	DangerousSlowDown,
} from "../types/ohgo_types";
import { db } from "../db";
import { roadEvents } from "../db/schema";
import { inArray } from "drizzle-orm";

export const webhookService = {
	/**
	 * Internal helper to send the webhook payload to a given URL
	 */
	async sendWebhook(
		url: string | undefined,
		payload: DiscordWebhookPayload,
	): Promise<void> {
		if (!url) {
			console.warn("Attempted to send webhook but no URL was provided.");
			return;
		}

		try {
			const response = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				const errorText = await response.text();
				console.error(
					`Discord webhook failed: ${response.status} ${response.statusText} - ${errorText}`,
				);
			}
		} catch (error) {
			console.error("Failed to send webhook to Discord:", error);
		}
	},

	// --- FORMATTERS ---

	formatIncidentToEmbed(incident: Incident): DiscordEmbed {
		return {
			title: `🚨 Incident: ${incident.routeName || "Unknown Route"}`,
			description: incident.description || "No description provided.",
			color: DiscordColors.RED,
			timestamp: new Date().toISOString(),
			fields: [
				{
					name: "Location",
					value: incident.location || "Unknown",
					inline: true,
				},
				{
					name: "Direction",
					value: incident.direction || "Unknown",
					inline: true,
				},
				{
					name: "Category",
					value: incident.category || "Incident",
					inline: true,
				},
			],
		};
	},

	formatConstructionToEmbed(construction: Construction): DiscordEmbed {
		return {
			title: `🚧 Construction: ${construction.routeName || "Unknown Route"}`,
			description: construction.description || "No description provided.",
			color: DiscordColors.YELLOW,
			timestamp: new Date().toISOString(),
			fields: [
				{
					name: "Location",
					value: construction.location || "Unknown",
					inline: true,
				},
				{
					name: "Direction",
					value: construction.direction || "Unknown",
					inline: true,
				},
			],
		};
	},

	formatSlowdownToEmbed(slowdown: DangerousSlowDown): DiscordEmbed {
		return {
			title: `⚠️ Dangerous Slowdown: ${slowdown.routeName || "Unknown Route"}`,
			description: slowdown.description || "Traffic has significantly slowed.",
			color: DiscordColors.ORANGE,
			timestamp: new Date().toISOString(),
			fields: [
				{
					name: "Location",
					value: slowdown.location || "Unknown",
					inline: true,
				},
				{
					name: "Direction",
					value: slowdown.direction || "Unknown",
					inline: true,
				},
			],
		};
	},

	// --- NOTIFIERS ---

	async notifyNewIncident(incident: Incident): Promise<void> {
		const embed = this.formatIncidentToEmbed(incident);
		const payload: DiscordWebhookPayload = { embeds: [embed] };
		await this.sendWebhook(env.DISCORD_INCIDENTS_WEBHOOK_URL, payload);
	},

	async notifyNewConstruction(construction: Construction): Promise<void> {
		const embed = this.formatConstructionToEmbed(construction);
		const payload: DiscordWebhookPayload = { embeds: [embed] };
		await this.sendWebhook(env.DISCORD_CONSTRUCTION_WEBHOOK_URL, payload);
	},

	async notifyNewSlowdown(slowdown: DangerousSlowDown): Promise<void> {
		const embed = this.formatSlowdownToEmbed(slowdown);
		const payload: DiscordWebhookPayload = { embeds: [embed] };
		await this.sendWebhook(env.DISCORD_SLOWDOWNS_WEBHOOK_URL, payload);
	},

	async sendDailyFeed(
		construction: Construction[],
		slowdowns: DangerousSlowDown[],
	): Promise<void> {
		const newConstruction: Construction[] = [];
		const newSlowdowns: DangerousSlowDown[] = [];

		// Filter new construction
		if (construction.length > 0) {
			const ids = construction.map((c) => c.id);
			const existing = await db
				.select({ id: roadEvents.id })
				.from(roadEvents)
				.where(inArray(roadEvents.id, ids));
			const existingIds = new Set(existing.map((e) => e.id));

			for (const item of construction) {
				if (!existingIds.has(item.id)) {
					newConstruction.push(item);
				}
			}
		}

		// Filter new slowdowns
		if (slowdowns.length > 0) {
			const ids = slowdowns.map((s) => s.id);
			const existing = await db
				.select({ id: roadEvents.id })
				.from(roadEvents)
				.where(inArray(roadEvents.id, ids));
			const existingIds = new Set(existing.map((e) => e.id));

			for (const item of slowdowns) {
				if (!existingIds.has(item.id)) {
					newSlowdowns.push(item);
				}
			}
		}

		// NOTE: Discord limits webhooks to 10 embeds per message.
		const embeds: DiscordEmbed[] = [];
		const eventsToInsert: (typeof roadEvents.$inferInsert)[] = [];

		for (const item of newConstruction.slice(0, 5)) {
			embeds.push(this.formatConstructionToEmbed(item));
			eventsToInsert.push({
				id: item.id,
				eventType: "construction",
				location: item.location || "",
				description: item.description || "",
				latitude: item.latitude || 0,
				longitude: item.longitude || 0,
				rawPayload: item,
			});
		}

		for (const item of newSlowdowns.slice(0, 5)) {
			embeds.push(this.formatSlowdownToEmbed(item));
			eventsToInsert.push({
				id: item.id,
				eventType: "slowdown",
				location: item.location || "",
				description: item.description || "",
				latitude: item.latitude || 0,
				longitude: item.longitude || 0,
				rawPayload: item,
			});
		}

		if (embeds.length === 0) {
			console.log("No new events to send for the daily feed.");
			return;
		}

		// Save the new events to the database so we don't send them again tomorrow
		if (eventsToInsert.length > 0) {
			await db.insert(roadEvents).values(eventsToInsert).onConflictDoNothing();
		}

		const payload: DiscordWebhookPayload = {
			content: "🌅 **Daily Traffic Digest**",
			embeds: embeds,
		};

		// Sending to incidents channel by default for the daily feed
		await this.sendWebhook(env.DISCORD_INCIDENTS_WEBHOOK_URL, payload);
	},
};
