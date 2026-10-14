import type { Construction, OhgoApiResponse } from "../../../src/types/ohgo";

export const createMockConstruction = (
	overrides: Partial<Construction>,
): Construction => ({
	// TODO Fill this out
	...overrides,
});

export const createMockConstructionResponse = (
	construction: Construction[] = [],
): OhgoApiResponse<Construction> => ({
	links: [],
	// TODO Fill this out
});

export const mockConstructionListResponse = createMockConstructionResponse([
	createMockConstruction({
		// TODO
	}),
	createMockConstruction({
		// TODO
	}),
]);

export const mockEmptyConstructionResponse = createMockConstructionResponse([]);
