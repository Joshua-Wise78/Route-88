export type OhgoRegions =
	| "akron"
	| "central-ohio"
	| "cincinnati"
	| "cleveland"
	| "columbus"
	| "dayton"
	| "ne-ohio"
	| "nw-ohio"
	| "se-ohio"
	| "sw-ohio"
	| "toledo";

export interface OhgoBaseParams {
	region?: OhgoRegions | (string & {});
	radius?: string;
	"map-bounds-sw"?: string;
	"map-bounds-ne"?: string;
	"page-size"?: number;
	page?: number;
	"page-all"?: boolean | "true" | "false" | 1 | 0;

	[key: string]: string | number | boolean | undefined;
}

export interface OhgoConstructionParams extends OhgoBaseParams {
	"include-future"?: string;
	"future-only"?: string;
}
