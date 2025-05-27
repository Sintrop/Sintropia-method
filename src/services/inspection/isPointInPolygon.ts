import { booleanPointInPolygon, point } from "@turf/turf";

interface IsPointInPolygonProps {
  coord: { latitude: number; longitude: number };
  polygonCoords: [number, number][];
}

export function isPointInPolygon({ coord, polygonCoords }: IsPointInPolygonProps): boolean {
  const pt = point([coord.longitude, coord.latitude]);
  const polygon = {
    type: 'Polygon',
    coordinates: [polygonCoords]
  };

  //@ts-ignore
  return booleanPointInPolygon(pt, polygon);
}