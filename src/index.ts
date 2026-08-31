import { Hono } from "hono";
import { env } from "./config/env";
import discordRouter from "./routes/discord";
import mobileRouter from "./routes/mobile";
import { startScheduler } from "./services/scheduler";

const app = new Hono();

app.get("/", (c) => c.text("Route-88 Backend API is running!"));

// Mount the Discord routes
app.route("/api/discord", discordRouter);
app.route("/api/mobile", mobileRouter);

// Start the background jobs
startScheduler();

console.log(`Server is starting...`);
console.log(
	`Loaded Discord Webhook Incidents ${!!env.DISCORD_INCIDENTS_WEBHOOK_URL}`,
);
console.log(
	`Loaded Discord Webhook Construction ${!!env.DISCORD_CONSTRUCTION_WEBHOOK_URL}`,
);
console.log(
	`Loaded Discord Webhook Slowdowns ${!!env.DISCORD_SLOWDOWNS_WEBHOOK_URL}`,
);
console.log(
	`Loaded Discord Webhook Daily Feed ${!!env.DISCORD_DAILY_WEBHOOK_URL}`,
);

export default {
	port: 3333,
	fetch: app.fetch,
};
