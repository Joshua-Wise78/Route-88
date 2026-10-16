import type {
	RoadEventFeature_4_2,
	WZDX_4_2,
} from "../../../src/types/ohgo";

export const createMockWzdxFeature = (
	overrides?: Partial<RoadEventFeature_4_2>,
): RoadEventFeature_4_2 => ({
	id: "wzdx-ohgo-9003",
	type: "Feature",
	properties: {
		coreDetails: {
			dataSourceId: "odot-wzdx-source-1",
			eventType: "work-zone",
			name: "I-71 Resurfacing Work Zone",
			description: "Right lane closed for resurfacing operations",
			direction: "Northbound",
			roadNames: ["I-71"],
			updateDate: "2026-10-15T12:00:00Z",
		},
		startDate: "2026-10-01T07:00:00Z",
		endDate: "2026-11-01T17:00:00Z",
		beginningAccuracy: "estimated",
		endingAccuracy: "estimated",
		vehicleImpact: "some-lanes-closed",
		locationMethod: "channel-device-method",
		isStartDateVerified: true,
		isEndDateVerified: true,
		isStartPositionVerified: true,
		isEndPositionVerified: true,
	},
	geometry: {
		type: "LineString",
		coordinates: [
			[-82.9988, 39.9612],
			[-82.992, 39.965],
		],
	},
	...overrides,
});

export const createMockWzdxFeedResponse = (
	features: RoadEventFeature_4_2[] = [],
	overrides?: Partial<WZDX_4_2>,
): WZDX_4_2 => ({
	type: "FeatureCollection",
	feedInfo: {
		publisher: "Ohio Department of Transportation",
		version: "4.2",
		license: "https://creativecommons.org/publicdomain/zero/1.0/",
		updateFrequency: 300,
		contactName: "ODOT Traffic Operations",
		contactEmail: "traffic@dot.ohio.gov",
		dataSources: [
			{
				dataSourceId: "odot-wzdx-source-1",
				organizationName: "ODOT",
			},
		],
	},
	features,
	...overrides,
});

export const createMockWzdxFeed = createMockWzdxFeedResponse;

export const mockWzdxFeedResponse = createMockWzdxFeedResponse([
	createMockWzdxFeature({
		id: "wzdx-101",
	}),
	createMockWzdxFeature({
		id: "wzdx-102",
		properties: {
			coreDetails: {
				dataSourceId: "odot-wzdx-source-1",
				eventType: "detour",
				name: "I-70 Detour",
				description: "Detour route via SR-315 due to bridge repair",
				direction: "Eastbound",
				roadNames: ["I-70"],
				updateDate: "2026-10-15T12:00:00Z",
			},
			startDate: "2026-10-05T00:00:00Z",
			endDate: "2026-10-20T23:59:59Z",
			beginningAccuracy: "verified",
			endingAccuracy: "verified",
			vehicleImpact: "all-lanes-closed",
			locationMethod: "channel-device-method",
			isStartDateVerified: true,
			isEndDateVerified: true,
			isStartPositionVerified: true,
			isEndPositionVerified: true,
		},
		geometry: {
			type: "LineString",
			coordinates: [
				[-83.001, 39.96],
				[-82.995, 39.962],
			],
		},
	}),
]);

export const mockEmptyWzdxFeedResponse = createMockWzdxFeedResponse([]);
