import { Base } from '../ohgo';

export interface Incident extends Base {
   roadStatus: string;
   roadClosureDetail?: RoadClosureDetail;
}

export interface RoadClosureDetail {
   closureStartLocation: number[];
   closureEndLocation: number[];
   polyline: number[][];
}
