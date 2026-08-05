import { Base } from './ohgo';

export interface Construction extends Base {
   status: string;
   district: string;
   startDate: string;
   endDate: string;
   workZones?: ConstructionWorkZone[];
   detours?: ConstructionDetour[];
}

export interface ConstructionWorkZone {
   description?: string;
   startLocation?: number[];
   endLocation?: number[];
   polyLine?: number[][];
}

export interface ConstructionDetour {
   name?: string;
   description?: string;
   startDate?: string;
   endDate?: string;
   detourRoutes?: ConstructionDetourRoute[];
}

export interface ConstructionDetourRoute {
   roadName?: string;
   startLocation?: number[];
   endLocation?: number[];
   polyLine?: number[][];
}

