export interface AreaDBProps {
  id: number;
  name: string;
  description: string;
  inspectionId?: string;
  regeneratorAddress?: string;
  coordinates: string;
  size: number;
  proofPhoto: string;
  status: number;
}

export interface InspectionDBProps {
  id: number;
  inspectionId: string;
  regeneratorAddress: string;
}

export interface SamplingDBProps {
  id: number;
  areaId: number;
  size: number;
  number: number;
}

export interface BiodiversityDBProps {
  id: number;
  photo: string;
  areaId: number;
  specieData: string;
  coordinate: string;
}

export interface TreeDBProps {
  id: number
  photo: string;
  areaId: number;
  specieData: string;
  samplingNumber: number;
  samplingId: number;
  coordinate: string;
}