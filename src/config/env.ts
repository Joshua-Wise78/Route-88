import * as dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
	DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
	OHGO_API_KEY: z.string().min(1, "API_KEY is required"),
	DISCORD_INCIDENTS_WEBHOOK_URL: z.string().min(1, "Incident url is required"),
	DISCORD_CONSTRUCTION_WEBHOOK_URL: z
		.string()
		.min(1, "Construction url is required"),
	DISCORD_SLOWDOWNS_WEBHOOK_URL: z.string().min(1, "Slowdowns url is required"),
	DISCORD_DAILY_WEBHOOK_URL: z.string().min(1, "Daily url is required"),
	INTERNAL_API_KEY: z.string().min(1, "Internal API key required."),
});

export const env = envSchema.parse(process.env);
