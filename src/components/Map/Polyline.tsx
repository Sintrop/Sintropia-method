import React from 'react';
import {ShapeSource, LineLayer} from '@rnmapbox/maps';

interface Props {
  coordinates: [number, number][];
  lineColor: string;
  lineWidth: number;
}
export function Polyline({coordinates, lineColor, lineWidth}: Props) {
  if (coordinates.length > 0) {
    return (
      <ShapeSource
        id="linesource"
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
        }}>
        <LineLayer id="linelayer" style={{lineColor, lineWidth}} />
      </ShapeSource>
    );
  }
}
