import { env } from "../config/env";

export async function sendDiscordNotificaton(title: string, message: string) {
	if (!env.DISCORD_WEBHOOK_URL) return;

	await fetch(env.DISCORD_WEBHOOK_URL, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			embeds: [
				{
					title: title,
					description: message,
					color: 16734296,
					timestamp: new Date().toISOString(),
				},
			],
		}),
	});
}

export interface DiscordEmbed {
	title?: string;
	description?: string;
	color?: number;
	timestamp?: string;
	url?: string;
}

export async function sendDiscordEmbeds(embeds: DiscordEmbed[]) {
	if (!env.DISCORD_WEBHOOK_URL || embeds.length === 0) return;

	await fetch(env.DISCORD_WEBHOOK_URL, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			// Discord limits you to a maximum of 10 embeds per webhook post
			embeds: embeds.slice(0, 10), 
		}),
	});
}
