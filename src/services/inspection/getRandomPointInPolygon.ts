//@ts-ignore
import { point } from '@turf/helpers';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import bbox from '@turf/bbox';
import { AllGeoJSON } from '@turf/turf';

export function getRandomPointInPolygon(
  polygonCoords: [number, number][]
) : {latitude: number, longitude: number} {
  const polygon = {
    type: 'Polygon',
    coordinates: [polygonCoords],
  };

  const [minLng, minLat, maxLng, maxLat] = bbox(polygon as AllGeoJSON);

  let attempts = 0;
  while (attempts < 1000) {
    const randomLng = minLng + Math.random() * (maxLng - minLng);
    const randomLat = minLat + Math.random() * (maxLat - minLat);
    const randomPoint = point([randomLng, randomLat]);

    if (booleanPointInPolygon(randomPoint, polygon)) {
      return {
        latitude: randomLat,
        longitude: randomLng,
      };
    }

    attempts++;
  }

  throw new Error("Não foi possível encontrar um ponto dentro do polígono após várias tentativas.");
}