import { describe, expect, it } from "@jest/globals";
import {
	calculateBoundingBox,
	calculatePolylineDistanceMiles,
	haversineDistanceMiles,
	isPointInBoundingBox,
	pointToPolylineDistance,
	pointToSegmentDistanceMiles,
	toDeg,
	toRad,
} from "../../../src/utils/geo";

describe("Geospatial Utilities (geo.ts)", () => {
	describe("toRad and toDeg", () => {
		it("converts degrees to radians and back", () => {
			expect(toRad(180)).toBeCloseTo(Math.PI);
			expect(toDeg(Math.PI)).toBeCloseTo(180);
			expect(toRad(0)).toBe(0);
			expect(toDeg(0)).toBe(0);
		});
	});

	describe("haversineDistanceMiles", () => {
		it("returns 0 for identical points", () => {
			const dist = haversineDistanceMiles(39.9612, -82.9988, 39.9612, -82.9988);
			expect(dist).toBeCloseTo(0, 5);
		});

		it("calculates accurate distance between Columbus and Cincinnati (~100-110 miles)", () => {
			// Columbus: 39.9612, -82.9988
			// Cincinnati: 39.1031, -84.5120
			const dist = haversineDistanceMiles(39.9612, -82.9988, 39.1031, -84.512);
			expect(dist).toBeGreaterThan(95);
			expect(dist).toBeLessThan(115);
		});
	});

	describe("pointToSegmentDistanceMiles", () => {
		const segStart = { lat: 39.0, lon: -84.0 };
		const segEnd = { lat: 39.0, lon: -83.0 }; // horizontal line along lat 39.0 (~53.8 miles)

		it("calculates distance when point is exactly on the segment", () => {
			const pointOnSeg = { lat: 39.0, lon: -83.5 };
			const result = pointToSegmentDistanceMiles(pointOnSeg, segStart, segEnd);

			expect(result.distanceMiles).toBeCloseTo(0, 2);
			expect(result.fraction).toBeCloseTo(0.5, 2);
		});

		it("calculates perpendicular offset from the segment", () => {
			// Point 0.1 degrees north of the midpoint (approx 6.9 miles north)
			const pointNorth = { lat: 39.1, lon: -83.5 };
			const result = pointToSegmentDistanceMiles(pointNorth, segStart, segEnd);

			expect(result.distanceMiles).toBeGreaterThan(6.5);
			expect(result.distanceMiles).toBeLessThan(7.2);
			expect(result.fraction).toBeCloseTo(0.5, 2);
		});

		it("clamps to start point if projection falls behind segStart", () => {
			const pointWest = { lat: 39.0, lon: -84.5 };
			const result = pointToSegmentDistanceMiles(pointWest, segStart, segEnd);

			expect(result.fraction).toBe(0);
			expect(result.distanceMiles).toBeGreaterThan(20);
		});

		it("clamps to end point if projection extends beyond segEnd", () => {
			const pointEast = { lat: 39.0, lon: -82.5 };
			const result = pointToSegmentDistanceMiles(pointEast, segStart, segEnd);

			expect(result.fraction).toBe(1);
			expect(result.distanceMiles).toBeGreaterThan(20);
		});

		it("handles zero-length segments", () => {
			const result = pointToSegmentDistanceMiles(
				{ lat: 39.1, lon: -84.0 },
				segStart,
				segStart,
			);
			expect(result.fraction).toBe(0);
			expect(result.distanceMiles).toBeGreaterThan(0);
		});
	});

	describe("calculatePolylineDistanceMiles", () => {
		it("returns 0 for empty or single-point polyline", () => {
			expect(calculatePolylineDistanceMiles([])).toBe(0);
			expect(calculatePolylineDistanceMiles([[-84.0, 39.0]])).toBe(0);
		});

		it("accumulates distances over multi-segment polyline", () => {
			const coords: [number, number][] = [
				[-84.0, 39.0],
				[-83.5, 39.0],
				[-83.0, 39.0],
			];
			const total = calculatePolylineDistanceMiles(coords);
			const expected = haversineDistanceMiles(39.0, -84.0, 39.0, -83.0);
			expect(total).toBeCloseTo(expected, 1);
		});
	});

	describe("pointToPolylineDistance", () => {
		const coords: [number, number][] = [
			[-84.0, 39.0], // P0
			[-83.5, 39.0], // P1
			[-83.0, 39.0], // P2
		];

		it("identifies closest segment and cumulative distance along route", () => {
			// Point near the second segment P1 -> P2
			const point = { lat: 39.02, lon: -83.25 };
			const result = pointToPolylineDistance(point, coords);

			expect(result.closestSegmentIndex).toBe(1);
			expect(result.minDistanceMiles).toBeLessThan(2);
			// The mile along route should be roughly 75% of total route
			expect(result.mileAlongRoute).toBeGreaterThan(result.totalRouteMiles * 0.7);
		});

		it("handles empty polyline gracefully", () => {
			const result = pointToPolylineDistance({ lat: 39.0, lon: -84.0 }, []);
			expect(result.minDistanceMiles).toBe(Infinity);
		});
	});

	describe("calculateBoundingBox and isPointInBoundingBox", () => {
		const coords: [number, number][] = [
			[-84.5, 39.1],
			[-83.0, 40.0],
		];

		it("calculates expanded bounding box with buffer", () => {
			const bbox = calculateBoundingBox(coords, 1.0); // 1 mile buffer

			expect(bbox.minLat).toBeLessThan(39.1);
			expect(bbox.maxLat).toBeGreaterThan(40.0);
			expect(bbox.minLon).toBeLessThan(-84.5);
			expect(bbox.maxLon).toBeGreaterThan(-83.0);

			expect(isPointInBoundingBox(39.5, -83.5, bbox)).toBe(true);
			expect(isPointInBoundingBox(45.0, -83.5, bbox)).toBe(false);
		});
	});
});
