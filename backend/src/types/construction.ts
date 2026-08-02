export interface Construction {
   id: string;
   latitude: number;
   longitude: number;
   description: string;
   category: string;
   direction: string;
   routeName: string;
   status: string;
   startDate: string;
   endDate?: string;
   workZone?: ConstructionWorkZone[];
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

