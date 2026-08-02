export interface Link { }

export interface OhgoApiResponse<T> {
   links: Link;
   totalPageCount: number;
   totalResultCount: number;
   currentResultCount: number;
   results: T[];
}

export * from './construction';
