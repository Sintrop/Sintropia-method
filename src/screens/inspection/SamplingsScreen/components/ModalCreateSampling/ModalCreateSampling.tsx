import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { Icon } from '../../../../../components/Icon/Icon';
import { CoordinateProps } from '../../../../../types/regenerator';
import {
  Camera,
  MapView,
  PointAnnotation,
  StyleURL,
  ShapeSource,
  FillLayer,
} from '@rnmapbox/maps';
import { Polyline } from '../../../../../components/Map/Polyline';
import { circle } from '@turf/turf';
import { getRandomPointInPolygon } from '../../../../../services/inspection/getRandomPointInPolygon';
import { useSQLite } from '../../../../../hooks/useSQLite';

interface Props {
  close: () => void;
  areaId: number;
  areaCoordinates: CoordinateProps[];
  samplingsCount: number;
  samplingCreated: () => void;
  samplingSize: number;
}

export function ModalCreateSampling({
  close,
  areaId,
  areaCoordinates: coords,
  samplingsCount,
  samplingCreated,
  samplingSize
}: Props) {
  const { t } = useTranslation();
  const { addSampling } = useSQLite();
  const [loadingCreate, setLoadingCreate] = useState(false);
  const pathPolyline: [number, number][] = coords.map(coord => [
    parseFloat(coord.longitude),
    parseFloat(coord.latitude),
  ]);
  pathPolyline.push([...pathPolyline[0]]);

  const [centerCoord, setCenterCoord] = useState<[number, number]>();
  const radius = samplingSize;

  const circleGeoJSON = circle(centerCoord ? centerCoord : [0, 0], radius, {
    steps: 64,
    units: 'meters',
  });

  async function handleGeneratePoint() {
    const response = await getRandomPointInPolygon(pathPolyline)
    setCenterCoord([response?.longitude, response?.latitude])
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
      size: samplingSize
    })
    samplingCreated();
    close();
    setLoadingCreate(false);
  }

  return (
    <Modal visible onRequestClose={close} animationType="slide" transparent>
      <View className="flex-1 bg-white">
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
          >
            <Camera
              centerCoordinate={[
                parseFloat(coords[0].longitude),
                parseFloat(coords[0].latitude),
              ]}
              zoomLevel={16}
            />

            {centerCoord && (
              <ShapeSource id="circlesource" shape={circleGeoJSON}>
                <FillLayer
                  id="circlelayer"
                  style={{
                    fillColor: 'rgba(0, 150, 255, 0.3)',
                    fillOutlineColor: 'rgba(0, 150, 255, 1)',
                  }}
                />
              </ShapeSource>
            )}

            <Polyline
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
              <Text className="font-semibold text-green-500">{t('generatePoint')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="w-full h-10 rounded-2xl bg-green-500 items-center justify-center mt-5"
              onPress={handleCreateSampling}
              style={{opacity: !centerCoord ? 0.5 : 1}}
              disabled={loadingCreate || !centerCoord}
            >
              <Text className="font-semibold text-white">{t('createSampling')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    height: 300,
    width: '100%',
  },
});
