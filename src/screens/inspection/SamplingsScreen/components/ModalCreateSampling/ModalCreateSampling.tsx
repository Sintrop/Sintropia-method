import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { Icon } from '../../../../../components/Icon/Icon';
import { CoordinateProps } from '../../../../../types/regenerator';
import Mapbox, {
  Camera,
  MapView,
  PointAnnotation,
  StyleURL,
} from '@rnmapbox/maps';
import { Polyline } from '../../../../../components/Map/Polyline';

interface Props {
  close: () => void;
  areaId: number;
  areaCoordinates: CoordinateProps[];
}

export function ModalCreateSampling({
  close,
  areaId,
  areaCoordinates: coords,
}: Props) {
  const { t } = useTranslation();
  const pathPolyline: [number, number][] = coords.map(coord => [
    parseFloat(coord.longitude),
    parseFloat(coord.latitude),
  ]);
  pathPolyline.push([...pathPolyline[0]]);

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
              zoomLevel={15}
            />

            <Polyline
              lineColor="red"
              lineWidth={4}
              coordinates={pathPolyline}
            />
          </MapView>
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
