import { Hono } from "hono";
import { env } from "./config/env";
import discordRouter from "./routes/discord";
import mobileRouter from "./routes/mobile";
import routeRouter from "./routes/route";
import { startScheduler } from "./services/scheduler";

const app = new Hono();

app.get("/", (c) => c.text("Route-88 Backend API is running!"));

app.route("/api/discord", discordRouter);
app.route("/api/mobile", mobileRouter);
app.route("/api/route", routeRouter);

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
