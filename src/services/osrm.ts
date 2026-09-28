export const routeService = {
	async getRoute(startAddress: string, endAddress: string) {
		const startCoords = await this.geocodeAddress(startAddress);
		const endCoords = await this.geocodeAddress(endAddress);

		const coordsString = `${startCoords.lon},${startCoords.lat};${endCoords.lon},${endCoords.lat}`;
		const osrmUrl = `http://osrm:5000/route/v1/driving/${coordsString}?overview=full&geometries=geojson&steps=true`;

		const osrmResponse = await fetch(osrmUrl);
		const osrmData = await osrmResponse.json();

		if (
			osrmData.code !== "Ok" ||
			!osrmData.routes ||
			osrmData.routes.length === 0
		) {
			throw new Error("Could not calculate a route between these locations.");
		}

		const route = osrmData.routes[0];
		const rawSteps = route.legs[0]?.steps || [];

		const turnByTurn = rawSteps.map((step: any) => {
			const type = step.maneuver.type;
			const modifer = step.maneuver.modifier
				? ` ${step.maneuver.modifier}`
				: "";

			const streetName = step.name ? ` onto ${step.name}` : "";

			const instruction =
				type === "arrive"
					? `Arrive at destination`
					: `${type}${modifer}${streetName}`;

			return {
				instruction: instruction,
				distancemeters: step.distance,
				durationSeconds: step.duration,
				location: {
					lon: step.maneuver.location[0],
					lat: step.maneuver.location[1],
				},
				manueverType: type,
				manueverModifier: step.maneuver.modifier,
			};
		});

		return {
			distance: route.distance,
			duration: route.duration,
			geometry: route.geometry,
			startLocation: startCoords,
			endLocaiton: endCoords,
			steps: turnByTurn,
		};
	},

	async autocompleteAddress(query: string) {
		const url = new URL("http://nominatim:8080/search");
		url.searchParams.set("q", query);
		url.searchParams.set("format", "json");
		url.searchParams.set("limit", "5");
		url.searchParams.set("addressdetails", "1");

		const response = await fetch(url.toString());
		const data = await response.json();

		return data.map((item: any) => ({
			id: item.place_id,
			displayName: item.display_name,
			lat: parseFloat(item.lat),
			lon: parseFloat(item.lon),
			street: item.address?.road || item.address?.predestrian,
			city: item.address?.city || item.address?.town || item.address?.village,
		}));
	},

	async geocodeAddress(address: string) {
		const url = new URL("http://nominatim:8080/search");
		url.searchParams.set("q", address);
		url.searchParams.set("format", "json");
		url.searchParams.set("limit", "1");

		const response = await fetch(url.toString());
		const data = await response.json();

		if (!data || data.length === 0) {
			throw new Error(`Address not found: ${address}`);
		}

		return {
			lat: parseFloat(data[0].lat),
			lon: parseFloat(data[0].lon),
			displayName: data[0].display_name,
		};
	},
};
