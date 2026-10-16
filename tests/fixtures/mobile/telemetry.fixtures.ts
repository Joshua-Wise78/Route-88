import type { GenericTelemetry } from "../../../src/types/mobile/mobile";

export const createMockGenericTelemetry = (
	overrides?: Partial<GenericTelemetry>,
): GenericTelemetry => ({
	id: "inc-101",
	type: "incident",
	title: "Accident",
	description: "Right lane blocked due to collision",
	latitude: 39.9612,
	longitude: -82.9988,
	...overrides,
});

export const mockGenericTelemetryList: GenericTelemetry[] = [
	createMockGenericTelemetry({
		id: "inc-inc-101",
		type: "incident",
		title: "Accident",
		description: "Right lane blocked due to collision",
	}),
	createMockGenericTelemetry({
		id: "inc-inc-102",
		type: "incident",
		title: "Harzard",
		description: "I-70 Eastbound at Mile Marker 105",
	}),
	createMockGenericTelemetry({
		id: "slow-slowdown-101",
		type: "slowdown",
		title: "Slowdown",
		description: "Slowdowns expected for 5 minutes.",
	}),
	createMockGenericTelemetry({
		id: "slow-slowdown-102",
		type: "slowdown",
		title: "Hazard",
		description: "I-70 Eastbound at Mile Marker 105",
	}),
	createMockGenericTelemetry({
		id: "const-con-101",
		type: "construction",
		title: "Roadwork",
		description: "Right lane closed for road construction and resurfacing",
		startTime: "2026-10-01T07:00:00Z",
	}),
	createMockGenericTelemetry({
		id: "const-con-102",
		type: "construction",
		title: "Bridge Repair",
		description: "Right lane closed for road construction and resurfacing",
		startTime: "2026-10-01T07:00:00Z",
	}),
];
