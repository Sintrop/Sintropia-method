import { circle } from '@turf/turf';
import type { Feature, FeatureCollection, Point, Polygon } from 'geojson';
import { CoordinateProps } from '../types/regenerator';

export type LngLat = [number, number];

export interface Bounds {
  ne: LngLat;
  sw: LngLat;
}

/**
 * Coordinates are stored as JSON strings and their values may be strings
 * ("-23.54") or numbers. Native map views on iOS drop string values, so every
 * coordinate must go through this before reaching the map.
 */
export function parseStoredCoordinate(
  coordinate: string | null | undefined,
): LngLat | null {
  if (!coordinate) return null;

  try {
    const parsed = JSON.parse(coordinate) as Partial<
      Record<'latitude' | 'longitude', string | number>
    >;
    const latitude = Number(parsed?.latitude);
    const longitude = Number(parsed?.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
    return [longitude, latitude];
  } catch {
    return null;
  }
}

export function coordinateToLngLat(coordinate: CoordinateProps): LngLat {
  return [parseFloat(coordinate.longitude), parseFloat(coordinate.latitude)];
}

/** Closed ring (first point repeated at the end) for polygons and outlines. */
export function areaRing(coordinates: CoordinateProps[]): LngLat[] {
  const ring = coordinates.map(coordinateToLngLat);
  if (ring.length > 0) ring.push([...ring[0]]);
  return ring;
}

export function boundsOf(positions: LngLat[]): Bounds | null {
  if (positions.length === 0) return null;

  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  for (const [lng, lat] of positions) {
    minLng = Math.min(minLng, lng);
    minLat = Math.min(minLat, lat);
    maxLng = Math.max(maxLng, lng);
    maxLat = Math.max(maxLat, lat);
  }

  return { ne: [maxLng, maxLat], sw: [minLng, minLat] };
}

export function pointsCollection(
  positions: LngLat[],
): FeatureCollection<Point> {
  return {
    type: 'FeatureCollection',
    features: positions.map((coordinates, index) => ({
      type: 'Feature',
      id: index,
      properties: {},
      geometry: { type: 'Point', coordinates },
    })),
  };
}

export interface SamplingShape {
  id: number;
  number: number;
  center: LngLat;
  radius: number;
}

export function samplingCirclesCollection(
  samplings: SamplingShape[],
  highlightedId?: number,
): FeatureCollection<Polygon> {
  return {
    type: 'FeatureCollection',
    features: samplings.map(
      sampling =>
        ({
          ...circle(sampling.center, sampling.radius, {
            steps: 64,
            units: 'meters',
          }),
          id: sampling.id,
          properties: {
            number: String(sampling.number),
            highlighted: sampling.id === highlightedId,
          },
        } as Feature<Polygon>),
    ),
  };
}

export function samplingCentersCollection(
  samplings: SamplingShape[],
  highlightedId?: number,
): FeatureCollection<Point> {
  return {
    type: 'FeatureCollection',
    features: samplings.map(sampling => ({
      type: 'Feature',
      id: sampling.id,
      properties: {
        number: String(sampling.number),
        highlighted: sampling.id === highlightedId,
      },
      geometry: { type: 'Point', coordinates: sampling.center },
    })),
  };
}
