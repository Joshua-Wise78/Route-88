# Route Hazard & Clearance Analyzer ("Is My Route Clear?")

The **Is My Route Clear** feature analyzes a vehicle's intended travel corridor against active real-time traffic incidents, hazardous slowdowns, and construction zones.

---

## Key Capabilities

1. **Perpendicular Corridor Buffer Matching**: Computes the exact perpendicular distance from any road event to the route polyline.
2. **Driving Order & Mile Markers**: Calculates the cumulative distance (`mileMarkerOnRoute`) along the trip where each hazard is encountered, sorting hazards in the order the driver will reach them.
3. **Severe Hazard & Closure Detection**: Flags road closures, multi-vehicle crashes, and critical incidents with caution warnings.
4. **Resilient Routing with Fallback**: Queries OSRM for turn-by-turn road geometry; if OSRM is unavailable, gracefully falls back to a straight-line corridor check.
5. **Custom Polyline Support**: Accepts custom GeoJSON coordinate arrays from third-party map providers (Mapbox, Leaflet, Google Maps) via POST.

---

## API Endpoints

### 1. `GET /api/route/check` (or `/api/route/is-clear`)

Query parameters:
- `startLat` (number, required): Starting latitude (-90 to 90).
- `startLon` (number, required): Starting longitude (-180 to 180).
- `endLat` (number, required): Destination latitude (-90 to 90).
- `endLon` (number, required): Destination longitude (-180 to 180).
- `bufferMiles` (number, optional, default: 0.5): Corridor width in miles.

**Example Request**:
```bash
curl "http://localhost:3333/api/route/check?startLat=39.9612&startLon=-82.9988&endLat=39.1031&endLon=-84.5120&bufferMiles=0.5"
```

### 2. `POST /api/route/check`

JSON Body parameters:
- `coordinates` (`[number, number][]`, optional): GeoJSON `[longitude, latitude]` polyline array.
- `startLat`, `startLon`, `endLat`, `endLon` (numbers, optional): Starting and destination coordinates.
- `bufferMiles` (number, optional, default: 0.5): Corridor width in miles.

**Example Request**:
```bash
curl -X POST http://localhost:3333/api/route/check \
  -H "Content-Type: application/json" \
  -d '{
    "coordinates": [
      [-82.9988, 39.9612],
      [-83.5, 39.5],
      [-84.512, 39.1031]
    ],
    "bufferMiles": 1.0
  }'
```

---

## Response Structure

```json
{
  "success": true,
  "isClear": false,
  "status": "moderate_hazards",
  "summary": {
    "totalHazards": 2,
    "incidentsCount": 1,
    "slowdownsCount": 0,
    "constructionCount": 1,
    "message": "Moderate hazards along your route (1 incidents, 0 slowdowns, 1 construction zones)."
  },
  "route": {
    "totalDistanceMiles": 100.1,
    "totalDurationSeconds": 8008,
    "start": { "lat": 39.9612, "lon": -82.9988 },
    "end": { "lat": 39.1031, "lon": -84.512 },
    "isEstimatedRoute": false
  },
  "corridorBufferMiles": 0.5,
  "hazards": [
    {
      "id": "inc-10923",
      "type": "incident",
      "title": "Crash",
      "description": "Right lane blocked after exit 12",
      "location": "I-71 Southbound",
      "direction": "southbound",
      "routeName": "I-71",
      "latitude": 39.81,
      "longitude": -83.15,
      "distanceFromRouteMiles": 0.04,
      "mileMarkerOnRoute": 14.2,
      "severity": "medium",
      "isRoadClosed": false
    }
  ]
}
```
