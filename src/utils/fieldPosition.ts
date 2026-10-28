import { booleanPointInPolygon, distance, point } from '@turf/turf';
import type { Polygon } from 'geojson';
import { LngLat, SamplingShape } from './geo';

export type FieldPosition =
  | { kind: 'waiting' }
  | { kind: 'outside' }
  | { kind: 'inArea' }
  | { kind: 'inSampling'; sampling: SamplingShape };

/**
 * Where the inspector stands: outside the area, inside it, or inside one of
 * the samplings (the closest center wins when circles overlap).
 */
export function getFieldPosition(
  position: LngLat | null,
  areaRing: LngLat[],
  samplings: SamplingShape[],
): FieldPosition {
  if (!position) return { kind: 'waiting' };
  if (areaRing.length < 4) return { kind: 'waiting' };

  const here = point(position);
  const area: Polygon = { type: 'Polygon', coordinates: [areaRing] };

  let closest: { sampling: SamplingShape; meters: number } | null = null;
  for (const sampling of samplings) {
    const meters = distance(here, point(sampling.center), { units: 'meters' });
    if (meters <= sampling.radius && (!closest || meters < closest.meters)) {
      closest = { sampling, meters };
    }
  }
  if (closest) return { kind: 'inSampling', sampling: closest.sampling };

  return booleanPointInPolygon(here, area)
    ? { kind: 'inArea' }
    : { kind: 'outside' };
}

/** Trees per sampling id, for the sampling chips and the report. */
export function countTreesBySampling(trees: { samplingId: number }[]) {
  const counts: Record<number, number> = {};
  for (const tree of trees) {
    counts[tree.samplingId] = (counts[tree.samplingId] ?? 0) + 1;
  }
  return counts;
}
