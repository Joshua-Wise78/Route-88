import { Base } from './ohgo';

export interface DangerousSlowDown extends Base {
   normalMPH: number;
   currentMPH: number;
}
