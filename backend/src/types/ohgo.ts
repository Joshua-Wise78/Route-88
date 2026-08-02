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

export * from './construction';
export * from './incident';
export * from './slowdown';
export * from './wzdx';
