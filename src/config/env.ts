import * as dotenv from "dotenv";
import { z } from "zod";

const envPath = process.env.ENV_FILE || ".env";
dotenv.config({ path: envPath });

const envSchema = z.object({
	DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
	OHGO_API_KEY: z.string().min(1, "OHGO_API_KEY is required"),
	DISCORD_INCIDENTS_WEBHOOK_URL: z.string().optional(),
	DISCORD_CONSTRUCTION_WEBHOOK_URL: z.string().optional(),
	DISCORD_SLOWDOWNS_WEBHOOK_URL: z.string().optional(),
	DISCORD_DAILY_WEBHOOK_URL: z.string().optional(),
	INTERNAL_API_KEY: z.string().min(1, "Internal API key required."),
	OSRM_URL: z.string().default("http://osrm:5000"),
	NOMINATIM_URL: z.string().default("http://nominatim:8080"),
	PORT: z.coerce.number().default(3333),
	DEFAULT_REGION: z.string().default("sw-ohio"),
	ENABLE_SCHEDULER: z
		.string()
		.optional()
		.transform((val) => val === undefined || val === "true" || val === "1"),
});

export const env = envSchema.parse(process.env);
