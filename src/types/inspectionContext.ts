import { CoordinateProps } from './regenerator';

export interface StartInspectionProps {
  regenerator: {
    address: string;
    name: string;
  };
  coordinates: CoordinateProps[];
  areaSize: number;
  collectionMethod: 'manual' | 'sampling';
}
