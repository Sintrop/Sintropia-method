import React, { useMemo, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Camera, MapView, StyleURL, UserLocation } from '@rnmapbox/maps';
import { Polyline } from '../../../../../components/Map/Polyline';
import {
  SamplingCircles,
  samplingShapes,
} from '../../../../../components/Map/SamplingCircles';
import { TreesAndBiodiversityMarkers } from '../../../../../components/Map/RegisterMarkers';
import { useFitBounds } from '../../../../../hooks/useFitBounds';
import {
  BiodiversityDBProps,
  SamplingDBProps,
  TreeDBProps,
} from '../../../../../types/database';
import { CoordinateProps } from '../../../../../types/regenerator';
import { areaRing, boundsOf } from '../../../../../utils/geo';

/** Touch tolerance around a sampling marker, in screen points. */
const TOUCH_RADIUS = 28;

interface Props {
  areaCoordinates: CoordinateProps[];
  samplings: SamplingDBProps[];
  trees: TreeDBProps[];
  biodiversity: BiodiversityDBProps[];
  onPressSampling: (samplingId: number) => void;
}

export function SamplingsMap({
  areaCoordinates,
  samplings,
  trees,
  biodiversity,
  onPressSampling,
}: Props) {
  const { t } = useTranslation();
  const ring = useMemo(() => areaRing(areaCoordinates), [areaCoordinates]);
  const bounds = useMemo(() => boundsOf(ring), [ring]);
  const { cameraRef, onMapLoaded, defaultSettings } = useFitBounds(bounds, 30);
  const mapRef = useRef<MapView>(null);
  const shapes = useMemo(() => samplingShapes(samplings), [samplings]);

  // Hit-testing the layer is unreliable inside a ScrollView, so the touch is
  // matched against the samplings projected to screen points instead.
  async function handlePressMap(feature: GeoJSON.Feature) {
    const map = mapRef.current;
    const screenPoint = feature.properties as {
      screenPointX?: number;
      screenPointY?: number;
    } | null;
    if (
      !map ||
      shapes.length === 0 ||
      screenPoint?.screenPointX === undefined
    ) {
      return;
    }

    let closest: { id: number; distance: number } | null = null;
    for (const shape of shapes) {
      const [x, y] = await map.getPointInView(shape.center);
      const distance = Math.hypot(
        x - (screenPoint.screenPointX ?? 0),
        y - (screenPoint.screenPointY ?? 0),
      );
      if (!closest || distance < closest.distance) {
        closest = { id: shape.id, distance };
      }
    }

    if (closest && closest.distance <= TOUCH_RADIUS) {
      onPressSampling(closest.id);
    }
  }

  return (
    <View className="mt-5 rounded-2xl overflow-hidden">
      <MapView
        ref={mapRef}
        style={styles.map}
        onPress={handlePressMap}
        styleURL={StyleURL.SatelliteStreet}
        onDidFinishLoadingMap={onMapLoaded}
        scaleBarEnabled={false}
      >
        <Camera ref={cameraRef} defaultSettings={defaultSettings} />
        <UserLocation />
        <Polyline id="area" lineColor="red" lineWidth={3} coordinates={ring} />
        <SamplingCircles samplings={samplings} />
        <TreesAndBiodiversityMarkers
          trees={trees}
          biodiversity={biodiversity}
        />
      </MapView>

      {samplings.length > 0 && (
        <View className="absolute top-2 left-2 right-2 rounded-xl bg-white/90 px-3 py-1">
          <Text className="text-xs text-black text-center">
            {t('samplingsScreen.touchCircleToEnter')}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: 340,
  },
});
