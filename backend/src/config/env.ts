import * as dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
	DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
	OHGO_API_KEY: z.string().min(1, "API_KEY is required"),
	DISCORD_WEBHOOK_URL: z.string().min(1, "DISCORD_WEBHOOK_URL is required"),
});

export const env = envSchema.parse(process.env);
