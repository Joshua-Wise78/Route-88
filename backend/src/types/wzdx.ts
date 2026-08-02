export interface DataSource {
   dataSourceId?: string;
   organizationName?: string;
}

export interface FeedInfo {
   publisher?: string;
   version?: string;
   license?: string;
   updateFrequency?: number;
   contactName?: string;
   contactEmail?: string;
   dataSources?: DataSource[];
}

export interface Geometry {
   type: 'LineString' | 'MultiPoint' | string;
   coordinates: number[][] | number[];
}

export interface CoreDetails_4_2 {
   dataSourceId: string;
   eventType: 'work-zone' | 'detour' | 'restriction' | string;
   name: string;
   description: string;
   direction: string;
   roadNames: string[];
   updateDate: string;
}

export interface Properties_4_2 {
   coreDetails: CoreDetails_4_2;
   startDate: string;
   endDate: string;
   locationMethod?: string;
   vehicleImpact?: string;
   isStartDateVerified?: boolean;
   isEndDateVerified?: boolean;
   isStartPositionVerified?: boolean;
   isEndPositionVerified?: boolean;
   beginningAccuracy: string;
   endingAccuracy: string;
}

export interface RoadEventFeature_4_2 {
   id: string;
   type: 'Feature';
   properties: Properties_4_2;
   geometry: Geometry;
}

export interface WZDX_4_2 {
   type: 'FeatureCollection';
   feedInfo: FeedInfo;
   features: RoadEventFeature_4_2[];
}
