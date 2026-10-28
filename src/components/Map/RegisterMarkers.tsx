import React, { useMemo } from 'react';
import { CircleLayer, ShapeSource } from '@rnmapbox/maps';
import {
  parseStoredCoordinate,
  pointsCollection,
  LngLat,
} from '../../utils/geo';

export const TREE_MARKER_COLOR = '#22c55e';
export const BIODIVERSITY_MARKER_COLOR = '#eab308';

interface Props {
  id: string;
  coordinates: string[];
  color: string;
  radius: number;
}

/**
 * Registered trees/biodiversity drawn as a GeoJSON layer. PointAnnotation with
 * React children does not render reliably on iOS, a native layer does.
 */
export function RegisterMarkers({ id, coordinates, color, radius }: Props) {
  const shape = useMemo(
    () =>
      pointsCollection(
        coordinates
          .map(parseStoredCoordinate)
          .filter((position): position is LngLat => position !== null),
      ),
    [coordinates],
  );

  return (
    <ShapeSource id={`${id}-source`} shape={shape}>
      <CircleLayer
        id={`${id}-layer`}
        style={{
          circleColor: color,
          circleRadius: radius,
          circleStrokeColor: '#000000',
          circleStrokeWidth: 1,
        }}
      />
    </ShapeSource>
  );
}

interface TreesAndBiodiversityProps {
  trees: { coordinate: string }[];
  biodiversity: { coordinate: string }[];
}
export function TreesAndBiodiversityMarkers({
  trees,
  biodiversity,
}: TreesAndBiodiversityProps) {
  const treeCoordinates = useMemo(
    () => trees.map(item => item.coordinate),
    [trees],
  );
  const bioCoordinates = useMemo(
    () => biodiversity.map(item => item.coordinate),
    [biodiversity],
  );

  return (
    <>
      <RegisterMarkers
        id="trees"
        coordinates={treeCoordinates}
        color={TREE_MARKER_COLOR}
        radius={7}
      />
      <RegisterMarkers
        id="biodiversity"
        coordinates={bioCoordinates}
        color={BIODIVERSITY_MARKER_COLOR}
        radius={5}
      />
    </>
  );
}
