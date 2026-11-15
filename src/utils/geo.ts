export const EARTH_RADIUS_MILES = 3958.8;
export const EARTH_RADIUS_METERS = 6371000;
export const METERS_PER_MILE = 1609.344;

export interface GeoPoint {
	lat: number;
	lon: number;
}

export interface BoundingBox {
	minLat: number;
	maxLat: number;
	minLon: number;
	maxLon: number;
}

export interface SegmentDistanceResult {
	distanceMiles: number;
	fraction: number; // 0 (at segStart) to 1 (at segEnd)
	segmentLengthMiles: number;
}

export interface PolylineDistanceResult {
	minDistanceMiles: number;
	mileAlongRoute: number;
	totalRouteMiles: number;
	closestSegmentIndex: number;
}

export function toRad(deg: number): number {
	return (deg * Math.PI) / 180;
}

export function toDeg(rad: number): number {
	return (rad * 180) / Math.PI;
}

export function haversineDistanceMiles(
	lat1: number,
	lon1: number,
	lat2: number,
	lon2: number,
): number {
	const dLat = toRad(lat2 - lat1);
	const dLon = toRad(lon2 - lon1);
	const rLat1 = toRad(lat1);
	const rLat2 = toRad(lat2);

	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(rLat1) * Math.cos(rLat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return EARTH_RADIUS_MILES * c;
}

export function pointToSegmentDistanceMiles(
	point: GeoPoint,
	segStart: GeoPoint,
	segEnd: GeoPoint,
): SegmentDistanceResult {
	const midLatRad = toRad((segStart.lat + segEnd.lat) / 2);
	const cosMidLat = Math.cos(midLatRad);

	// Convert coordinates to planar Cartesian miles relative to segStart
	const x2 = toRad(segEnd.lon - segStart.lon) * EARTH_RADIUS_MILES * cosMidLat;
	const y2 = toRad(segEnd.lat - segStart.lat) * EARTH_RADIUS_MILES;

	const x0 = toRad(point.lon - segStart.lon) * EARTH_RADIUS_MILES * cosMidLat;
	const y0 = toRad(point.lat - segStart.lat) * EARTH_RADIUS_MILES;

	const segLengthSq = x2 * x2 + y2 * y2;

	if (segLengthSq < 1e-12) {
		const dist = haversineDistanceMiles(
			point.lat,
			point.lon,
			segStart.lat,
			segStart.lon,
		);
		return {
			distanceMiles: dist,
			fraction: 0,
			segmentLengthMiles: 0,
		};
	}

	// Projection scalar t of (x0, y0) onto line vector (x2, y2)
	const t = (x0 * x2 + y0 * y2) / segLengthSq;
	const clampedT = Math.max(0, Math.min(1, t));

	// Closest point on the segment
	const projX = clampedT * x2;
	const projY = clampedT * y2;

	const dx = x0 - projX;
	const dy = y0 - projY;
	const distanceMiles = Math.sqrt(dx * dx + dy * dy);
	const segmentLengthMiles = Math.sqrt(segLengthSq);

	return {
		distanceMiles,
		fraction: clampedT,
		segmentLengthMiles,
	};
}

export function calculatePolylineDistanceMiles(
	coordinates: [number, number][],
): number {
	if (coordinates.length < 2) return 0;
	let totalMiles = 0;
	for (let i = 0; i < coordinates.length - 1; i++) {
		const current = coordinates[i];
		const next = coordinates[i + 1];
		if (!current || !next) continue;
		totalMiles += haversineDistanceMiles(
			current[1],
			current[0],
			next[1],
			next[0],
		);
	}
	return totalMiles;
}

export function pointToPolylineDistance(
	point: GeoPoint,
	polylineCoordinates: [number, number][],
): PolylineDistanceResult {
	if (polylineCoordinates.length === 0) {
		return {
			minDistanceMiles: Infinity,
			mileAlongRoute: 0,
			totalRouteMiles: 0,
			closestSegmentIndex: -1,
		};
	}

	if (polylineCoordinates.length === 1) {
		const first = polylineCoordinates[0]!;
		const dist = haversineDistanceMiles(
			point.lat,
			point.lon,
			first[1],
			first[0],
		);
		return {
			minDistanceMiles: dist,
			mileAlongRoute: 0,
			totalRouteMiles: 0,
			closestSegmentIndex: 0,
		};
	}

	let minDistanceMiles = Infinity;
	let bestMileAlongRoute = 0;
	let closestSegmentIndex = 0;
	let cumulativeMiles = 0;

	for (let i = 0; i < polylineCoordinates.length - 1; i++) {
		const p1 = polylineCoordinates[i]!;
		const p2 = polylineCoordinates[i + 1]!;

		const segStart: GeoPoint = { lat: p1[1], lon: p1[0] };
		const segEnd: GeoPoint = { lat: p2[1], lon: p2[0] };

		const segResult = pointToSegmentDistanceMiles(point, segStart, segEnd);

		if (segResult.distanceMiles < minDistanceMiles) {
			minDistanceMiles = segResult.distanceMiles;
			bestMileAlongRoute =
				cumulativeMiles + segResult.fraction * segResult.segmentLengthMiles;
			closestSegmentIndex = i;
		}

		cumulativeMiles += segResult.segmentLengthMiles;
	}

	return {
		minDistanceMiles,
		mileAlongRoute: bestMileAlongRoute,
		totalRouteMiles: cumulativeMiles,
		closestSegmentIndex,
	};
}

export function calculateBoundingBox(
	coordinates: [number, number][],
	bufferMiles = 0.5,
): BoundingBox {
	if (coordinates.length === 0) {
		return { minLat: 0, maxLat: 0, minLon: 0, maxLon: 0 };
	}

	let minLat = Infinity;
	let maxLat = -Infinity;
	let minLon = Infinity;
	let maxLon = -Infinity;

	for (const coord of coordinates) {
		const lon = coord[0];
		const lat = coord[1];
		if (lat < minLat) minLat = lat;
		if (lat > maxLat) maxLat = lat;
		if (lon < minLon) minLon = lon;
		if (lon > maxLon) maxLon = lon;
	}

	const deltaLat = bufferMiles / 69.0;
	const midLatRad = toRad((minLat + maxLat) / 2);
	const cosMidLat = Math.max(0.1, Math.cos(midLatRad));
	const deltaLon = bufferMiles / (69.0 * cosMidLat);

	return {
		minLat: minLat - deltaLat,
		maxLat: maxLat + deltaLat,
		minLon: minLon - deltaLon,
		maxLon: maxLon + deltaLon,
	};
}

export function isPointInBoundingBox(
	lat: number,
	lon: number,
	bbox: BoundingBox,
): boolean {
	return (
		lat >= bbox.minLat &&
		lat <= bbox.maxLat &&
		lon >= bbox.minLon &&
		lon <= bbox.maxLon
	);
}
