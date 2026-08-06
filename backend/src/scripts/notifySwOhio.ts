import { ohgoService } from "../services/ohgo";
import { sendDiscordNotificaton } from "../utils/discord";

async function notifySouthWestOhio() {
	try {
		console.log("Fetching traffic data for South West Ohio...");

		const response = await ohgoService.getDangerousSlowdowns({
			region: "sw-ohio",
			"page-all": true,
		});

		const slowdowns = response.results || [];

		if (slowdowns.length === 0) {
			console.log("No slowdowns found. Sending all-clear to Discord...");
			await sendDiscordNotificaton(
				"🚦 SW Ohio Traffic Update",
				"No dangerous slowdowns reported in South West Ohio right now. Smooth sailing!",
			);
			return;
		}

		console.log(`Found ${slowdowns.length} slowdowns. Formatting message...`);
		let messageBody = `Found **${slowdowns.length}** dangerous slowdowns:\n\n`;

		const topSlowdowns = slowdowns.slice(0, 5);

		for (const item of topSlowdowns) {
			const route = item.routeName || "Unknown Route";
			messageBody += `• **${route}**: Speeds dropped from ${item.normalMPH}mph to **${item.currentMPH}mph**\n`;
			messageBody += `  *Location: ${item.location}*\n\n`;
		}

		if (slowdowns.length > 5) {
			messageBody += `*...and ${slowdowns.length - 5} more active slowdowns.*`;
		}

		console.log("Sending message to Discord Webhook...");
		await sendDiscordNotificaton("🚨 SW Ohio Traffic Alert", messageBody);

		console.log("Successfully sent Discord notification!");
	} catch (error) {
		console.error("Failed to fetch or send OHGO data:", error);
	}
}

// Execute the function
notifySouthWestOhio();
