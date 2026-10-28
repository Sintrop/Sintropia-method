import React, { forwardRef, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Camera, MapView, StyleURL } from '@rnmapbox/maps';
import { Polyline } from './Polyline';
import { SamplingCircles } from './SamplingCircles';
import { TreesAndBiodiversityMarkers } from './RegisterMarkers';
import { useFitBounds } from '../../hooks/useFitBounds';
import {
  BiodiversityDBProps,
  SamplingDBProps,
  TreeDBProps,
} from '../../types/database';
import { CoordinateProps } from '../../types/regenerator';
import { areaRing, boundsOf } from '../../utils/geo';

interface Props {
  coordinates: CoordinateProps[];
  samplings: SamplingDBProps[];
  trees: TreeDBProps[];
  biodiversity: BiodiversityDBProps[];
  showSamplings: boolean;
  height?: number;
}

/**
 * Static overview of a collection, framed on the area. It is also the image
 * captured for the PDF reports, so it has no controls drawn over it.
 */
export const CollectionMap = forwardRef<MapView, Props>(
  (
    {
      coordinates,
      samplings,
      trees,
      biodiversity,
      showSamplings,
      height = 260,
    },
    ref,
  ) => {
    const ring = useMemo(() => areaRing(coordinates), [coordinates]);
    const bounds = useMemo(() => boundsOf(ring), [ring]);
    const { cameraRef, onMapLoaded, defaultSettings } = useFitBounds(
      bounds,
      30,
    );

    return (
      <View className="rounded-3xl overflow-hidden border border-line">
        <MapView
          ref={ref}
          style={[styles.map, { height }]}
          styleURL={StyleURL.SatelliteStreet}
          onDidFinishLoadingMap={onMapLoaded}
          scaleBarEnabled={false}
        >
          <Camera ref={cameraRef} defaultSettings={defaultSettings} />
          <Polyline
            id="area"
            lineColor="red"
            lineWidth={3}
            coordinates={ring}
          />
          {showSamplings && <SamplingCircles samplings={samplings} />}
          <TreesAndBiodiversityMarkers
            trees={trees}
            biodiversity={biodiversity}
          />
        </MapView>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  map: { width: '100%' },
});
