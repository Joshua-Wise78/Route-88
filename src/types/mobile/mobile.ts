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

export const TelemetryTypeSchema = z.enum([
	"incident",
	"slowdown",
	"construction",
]);

export const GenericTelemetrySchema = z.object({
	id: z.string(),
	type: TelemetryTypeSchema,
	title: z.string(),
	description: z.string(),
	latitude: z.number(),
	longitude: z.number(),
	severity: z.string().optional(),
	startTime: z.string().optional(),
});

export const RouteQuerySchema = z.object({
	startAddress: z.string().min(5, "Start address is required"),
	endAddress: z.string().min(5, "End address is required"),
});

export const AutocompleteQuerySchema = z.object({
	query: z.string().min(2, "Please enter at least 2 characters to search"),
});

export type GenericTelemetry = z.infer<typeof GenericTelemetrySchema>;

export type DeviceIdentiySchema = z.infer<typeof DeviceIdentiySchema>;
export type LocationQuerySchema = z.infer<typeof LocationQuerySchema>;
