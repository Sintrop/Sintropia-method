import {InspectionDBProps} from './database';
import {CoordinateProps} from './regenerator';

export interface StartInspectionProps {
  inspection?: Omit<InspectionDBProps, 'id'>;
  coordinates: CoordinateProps[];
  areaSize: number
}
