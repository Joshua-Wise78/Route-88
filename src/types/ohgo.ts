export interface Link {
	href: string;
	rel: string;
	method?: string;
}

export interface Base {
	id: string;
	latitude: number;
	longitude: number;
	location: string;
	description: string;
	category: string;
	direction: string;
	routeName: string;
	links: Link[];
}

export interface OhgoApiResponse<T> {
	links: Link[];
	totalPageCount: number;
	totalResultCount: number;
	currentResultCount: number;
	results: T[];
}

export * from "./ohgo_types/construction";
export * from "./ohgo_types/incident";
export * from "./ohgo_types/params";
export * from "./ohgo_types/slowdown";
export * from "./ohgo_types/wzdx";
