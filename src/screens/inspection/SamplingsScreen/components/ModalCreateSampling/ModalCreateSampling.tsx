import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { Icon } from '../../../../../components/Icon/Icon';
import { CoordinateProps } from '../../../../../types/regenerator';
import {
  Camera,
  MapView,
  StyleURL,
  ShapeSource,
  FillLayer,
  LineLayer,
} from '@rnmapbox/maps';
import { Polyline } from '../../../../../components/Map/Polyline';
import { circle } from '@turf/turf';
import { getRandomPointInPolygon } from '../../../../../services/inspection/getRandomPointInPolygon';
import { useSQLite } from '../../../../../hooks/useSQLite';
import { useSafeAreaApp } from '../../../../../hooks/useSafeAreaApp';
import { useFitBounds } from '../../../../../hooks/useFitBounds';
import { SamplingCircles } from '../../../../../components/Map/SamplingCircles';
import { SamplingDBProps } from '../../../../../types/database';
import { areaRing, boundsOf } from '../../../../../utils/geo';

interface Props {
  close: () => void;
  areaId: number;
  areaCoordinates: CoordinateProps[];
  samplingsCount: number;
  samplingCreated: () => void;
  samplingSize: number;
  existingSamplings: SamplingDBProps[];
}

export function ModalCreateSampling({
  close,
  areaId,
  areaCoordinates: coords,
  samplingsCount,
  samplingCreated,
  samplingSize,
  existingSamplings,
}: Props) {
  const { t } = useTranslation();
  const { top, bottom } = useSafeAreaApp();
  const { addSampling } = useSQLite();
  const [loadingCreate, setLoadingCreate] = useState(false);
  const pathPolyline = useMemo(() => areaRing(coords), [coords]);
  const bounds = useMemo(() => boundsOf(pathPolyline), [pathPolyline]);
  const { cameraRef, onMapLoaded, defaultSettings } = useFitBounds(bounds, 30);

  const [centerCoord, setCenterCoord] = useState<[number, number]>();
  const radius = samplingSize;

  const circleGeoJSON = circle(centerCoord ? centerCoord : [0, 0], radius, {
    steps: 64,
    units: 'meters',
  });

  async function handleGeneratePoint() {
    const response = await getRandomPointInPolygon(pathPolyline);
    setCenterCoord([response?.longitude, response?.latitude]);
  }

  async function handleCreateSampling() {
    if (!centerCoord) return;

    setLoadingCreate(true);
    await addSampling({
      areaId,
      coordinate: JSON.stringify({
        latitude: centerCoord[1],
        longitude: centerCoord[0],
      }),
      number: samplingsCount + 1,
      size: samplingSize,
    });
    samplingCreated();
    close();
    setLoadingCreate(false);
  }

  return (
    <Modal visible onRequestClose={close} animationType="slide" transparent>
      <View
        className="flex-1 bg-white"
        style={{ paddingTop: top, paddingBottom: bottom }}
      >
        <View className="flex-row items-center justify-between h-14 border-b px-5">
          <View className="w-10" />
          <Text className="font-semibold text-black">
            {t('createSampling')}
          </Text>
          <View className="w-10">
            <Icon name="close" size={25} color="black" onPress={close} />
          </View>
        </View>

        <View>
          <MapView
            style={styles.mapContainer}
            styleURL={StyleURL.SatelliteStreet}
            onDidFinishLoadingMap={onMapLoaded}
          >
            <Camera ref={cameraRef} defaultSettings={defaultSettings} />

            <SamplingCircles samplings={existingSamplings} />

            {centerCoord && (
              <ShapeSource id="circlesource" shape={circleGeoJSON}>
                <FillLayer
                  id="circlelayer"
                  style={{ fillColor: 'rgba(0, 150, 255, 0.35)' }}
                />
                <LineLayer
                  id="circleoutline"
                  style={{ lineColor: 'rgb(0, 150, 255)', lineWidth: 2 }}
                />
              </ShapeSource>
            )}

            <Polyline
              id="area"
              lineColor="red"
              lineWidth={4}
              coordinates={pathPolyline}
            />
          </MapView>

          <View className="p-5">
            <TouchableOpacity
              className="w-full h-10 rounded-2xl border-2 border-green-500 items-center justify-center"
              onPress={handleGeneratePoint}
            >
              <Text className="font-semibold text-green-500">
                {t('generatePoint')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="w-full h-10 rounded-2xl bg-green-500 items-center justify-center mt-5"
              onPress={handleCreateSampling}
              style={{ opacity: !centerCoord ? 0.5 : 1 }}
              disabled={loadingCreate || !centerCoord}
            >
              <Text className="font-semibold text-white">
                {t('createSampling')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    height: 360,
    width: '100%',
  },
});
