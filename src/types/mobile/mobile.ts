import { z } from "zod";

export const DeviceIdentiySchema = z.object({
	deviceId: z.string().min(1, "Device ID cannot be empty"),
	osType: z.enum(["ios", "android", "unknown"]),
	appVersion: z.string().optional(),
});

export const LocationQuerySchema = z.object({
	latitude: z.coerce.number().min(-90).max(90).optional(),
	longitude: z.coerce.number().min(-180).max(180).optional(),
	radiusMiles: z.coerce.number().positive().default(25),
});

export type DeviceIdentiySchema = z.infer<typeof DeviceIdentiySchema>;
export type LocationQuerySchema = z.infer<typeof LocationQuerySchema>;
