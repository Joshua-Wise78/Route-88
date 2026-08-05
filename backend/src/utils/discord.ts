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
					descripiton: message,
					color: 16734296,
					timestamp: new Date().toISOString(),
				},
			],
		}),
	});
}
