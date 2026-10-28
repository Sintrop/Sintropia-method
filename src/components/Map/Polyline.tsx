import React from 'react';
import { ShapeSource, LineLayer } from '@rnmapbox/maps';

interface Props {
  id?: string;
  coordinates: [number, number][];
  lineColor: string;
  lineWidth: number;
}
export function Polyline({
  id = 'line',
  coordinates,
  lineColor,
  lineWidth,
}: Props) {
  if (coordinates.length === 0) return null;

  return (
    <ShapeSource
      id={`${id}-source`}
      shape={{
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates,
            },
            properties: {},
          },
        ],
      }}
    >
      <LineLayer id={`${id}-layer`} style={{ lineColor, lineWidth }} />
    </ShapeSource>
  );
}
