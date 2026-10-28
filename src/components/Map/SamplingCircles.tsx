import React, { useMemo } from 'react';
import {
  CircleLayer,
  FillLayer,
  LineLayer,
  ShapeSource,
  SymbolLayer,
} from '@rnmapbox/maps';
import { SamplingDBProps } from '../../types/database';
import {
  parseStoredCoordinate,
  samplingCentersCollection,
  samplingCirclesCollection,
  SamplingShape,
} from '../../utils/geo';

interface Props {
  samplings: SamplingDBProps[];
  highlightedId?: number;
  showNumbers?: boolean;
}

export function samplingShapes(samplings: SamplingDBProps[]): SamplingShape[] {
  const shapes: SamplingShape[] = [];
  samplings.forEach((sampling, index) => {
    const center = parseStoredCoordinate(sampling.coordinate);
    if (!center) return;
    shapes.push({
      id: sampling.id,
      number: index + 1,
      center,
      radius: sampling.size,
    });
  });
  return shapes;
}

export function SamplingCircles({
  samplings,
  highlightedId,
  showNumbers = true,
}: Props) {
  const shapes = useMemo(() => samplingShapes(samplings), [samplings]);
  const circles = useMemo(
    () => samplingCirclesCollection(shapes, highlightedId),
    [shapes, highlightedId],
  );
  const centers = useMemo(
    () => samplingCentersCollection(shapes, highlightedId),
    [shapes, highlightedId],
  );

  return (
    <>
      <ShapeSource id="samplings-source" shape={circles}>
        <FillLayer
          id="samplings-fill"
          style={{
            fillColor: [
              'case',
              ['get', 'highlighted'],
              'rgba(0, 150, 255, 0.35)',
              'rgba(255, 255, 255, 0.2)',
            ],
          }}
        />
        <LineLayer
          id="samplings-outline"
          style={{
            lineColor: [
              'case',
              ['get', 'highlighted'],
              'rgb(0, 150, 255)',
              'rgb(255, 255, 255)',
            ],
            lineWidth: 2,
          }}
        />
      </ShapeSource>

      {showNumbers && (
        <ShapeSource id="samplings-labels-source" shape={centers}>
          <CircleLayer
            id="samplings-labels-background"
            style={{
              circleRadius: 11,
              circleColor: [
                'case',
                ['get', 'highlighted'],
                'rgb(0, 150, 255)',
                'rgba(0, 0, 0, 0.6)',
              ],
              circleStrokeColor: '#ffffff',
              circleStrokeWidth: 2,
            }}
          />
          <SymbolLayer
            id="samplings-labels"
            style={{
              textField: ['get', 'number'],
              textSize: 13,
              textColor: '#ffffff',
              textAllowOverlap: true,
              textIgnorePlacement: true,
            }}
          />
        </ShapeSource>
      )}
    </>
  );
}
