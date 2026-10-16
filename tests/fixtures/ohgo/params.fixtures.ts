import type {
	OhgoBaseParams,
	OhgoConstructionParams,
} from "../../../src/types/ohgo";

export const createMockOhgoBaseParams = (
	overrides?: Partial<OhgoBaseParams>,
): OhgoBaseParams => ({
	region: "sw-ohio",
	"page-all": true,
	...overrides,
});

export const createMockOhgoConstructionParams = (
	overrides?: Partial<OhgoConstructionParams>,
): OhgoConstructionParams => ({
	region: "sw-ohio",
	"page-all": true,
	"include-future": "true",
	...overrides,
});

export const mockDefaultOhgoBaseParams = createMockOhgoBaseParams();
export const mockDefaultOhgoConstructionParams =
	createMockOhgoConstructionParams();
