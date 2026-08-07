import { Hono } from "hono";
import { env } from "./config/env";
import discordRouter from "./routes/discord";

const app = new Hono();

app.get("/", (c) => c.text("Route-88 Backend API is running!"));

// Mount the Discord routes
app.route("/api/discord", discordRouter);

console.log(`Server is starting...`);
console.log(`Loaded Discord Webhook URL? ${!!env.DISCORD_WEBHOOK_URL}`);

export default {
	port: 3333,
	fetch: app.fetch,
};
