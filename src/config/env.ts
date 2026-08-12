import * as dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
	DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
	OHGO_API_KEY: z.string().min(1, "API_KEY is required"),
	DISCORD_INCIDENTS_WEBHOOK_URL: z.string().url().optional(),
	DISCORD_CONSTRUCTION_WEBHOOK_URL: z.string().url().optional(),
	DISCORD_SLOWDOWNS_WEBHOOK_URL: z.string().url().optional(),
});

export const env = envSchema.parse(process.env);
