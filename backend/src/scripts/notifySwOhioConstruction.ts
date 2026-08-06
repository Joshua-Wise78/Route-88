import { ohgoService } from "../services/ohgo";
import { sendDiscordEmbeds, type DiscordEmbed } from "../utils/discord";

async function notifySouthWestOhioConstruction() {
	try {
		console.log("Fetching active construction data for South West Ohio...");

		const response = await ohgoService.getConstruction({
			region: "sw-ohio",
			"page-all": true,
		});

		const rawResults = response.results || [];
		const activeConstruction = Array.from(
			new Map(
				rawResults.map((site) => [site.description || site.id, site]),
			).values(),
		);

		if (activeConstruction.length === 0) {
			console.log("No active construction found.");
			return;
		}

		console.log(
			`Found ${activeConstruction.length} construction sites. Formatting embeds...`,
		);

		const embeds: DiscordEmbed[] = activeConstruction.map((site) => {
			const route = site.routeName || "Unknown Route";

			let description = `**Status:** ${site.status}\n`;
			description += `**Location:** ${site.location}\n`;
			if (site.description) {
				description += `\n*${site.description}*\n`;
			}

			if (site.startDate && site.endDate) {
				description += `\n🗓️ **Timeline:** ${new Date(site.startDate).toLocaleDateString()} - ${new Date(site.endDate).toLocaleDateString()}`;
			}

			return {
				title: `🚧 Construction on ${route}`,
				description: description,
				color: 16753920,
				timestamp: new Date().toISOString(),
			};
		});

		console.log(`Sending ${embeds.length} embeds to Discord Webhook...`);
		await sendDiscordEmbeds(embeds);

		console.log("Successfully sent Discord notification!");
	} catch (error) {
		console.error("Failed to fetch or send OHGO construction data:", error);
	}
}

notifySouthWestOhioConstruction();
