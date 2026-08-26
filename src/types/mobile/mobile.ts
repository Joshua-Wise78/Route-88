import { z } from "zod";

export const DeviceIdentiySchema = z.object({
	deviceId: z.string().min(1, "Device ID cannot be empty"),
	osType: z.enum(["ios", "android", "unknown"]),
	appVersion: z.string().optional(),
});

export type DeviceIdentiySchema = z.infer<typeof DeviceIdentiySchema>;
