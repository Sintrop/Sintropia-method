/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Screen } from '../../../components/Screen/Screen';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PreInspectionStackParamsList } from '../../../routes/PreInspectionRoutes';
import Mapbox, {
  Camera,
  MapView,
  PointAnnotation,
  StyleURL,
  offlineManager,
} from '@rnmapbox/maps';
//@ts-ignore
import { MAPBOX_ACCESS_TOKEN } from '@env';
import { Polyline } from '../../../components/Map/Polyline';
import { useInspectionContext } from '../../../hooks/useInspectionContext';

Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN ? MAPBOX_ACCESS_TOKEN : '');

type ScreenProps = NativeStackScreenProps<
  PreInspectionStackParamsList,
  'AreaPreviewScreen'
>;
export function AreaPreviewScreen({ route }: ScreenProps) {
  const { startInspection } = useInspectionContext();
  const { coords, inspection, regenerator, areaSize } = route.params;

  const { t } = useTranslation();
  const pathPolyline: [number, number][] = coords.map(coord => [
    parseFloat(coord.longitude),
    parseFloat(coord.latitude),
  ]);
  pathPolyline.push([...pathPolyline[0]]);

  const [loading, setLoading] = useState(false);

  async function handleStartInspection() {
    setLoading(true);
    downloadAreaMap();
    await startInspection({
      areaSize,
      coordinates: coords,
      inspection: {
        inspectionId: inspection.id.toString(),
        regeneratorAddress: inspection?.regenerator,
      },
    });
    setLoading(false);
  }

  function downloadAreaMap() {
    offlineManager.createPack(
      {
        name: coords[0].latitude,
        styleURL: StyleURL.SatelliteStreet,
        minZoom: 15,
        maxZoom: 19,
        bounds: [
          [parseFloat(coords[0]?.longitude), parseFloat(coords[0]?.latitude)], // Coordenadas sudoeste
          [parseFloat(coords[2]?.longitude), parseFloat(coords[2]?.latitude)], // Coordenadas nordeste
        ],
      },
      offlinePack => {
        offlinePack.resume();
        offlinePack
          .status()
          .then(res => {
            console.log('map downloaded: ' + res);
          })
          .catch(err => {
            console.log('error dowload map: ' + err)
          });
      },
      error => {
        console.error('Error creating pack', error);
      },
    );
  }

  return (
    <Screen screenTitle={t('areaPreview')} showBackButton scrollable>
      <MapView style={styles.mapContainer} styleURL={StyleURL.SatelliteStreet}>
        <Camera
          centerCoordinate={[
            parseFloat(coords[0].longitude),
            parseFloat(coords[0].latitude),
          ]}
          zoomLevel={15}
        />

        {coords.map((coord, index) => (
          <PointAnnotation
            key={index.toString()}
            coordinate={[
              parseFloat(coord?.longitude),
              parseFloat(coord.latitude),
            ]}
            id="marker"
          >
            <View />
          </PointAnnotation>
        ))}

        <Polyline lineColor="red" lineWidth={4} coordinates={pathPolyline} />
      </MapView>

      <Text>
        {t('areaSize')}: {Intl.NumberFormat('pt-BR').format(areaSize)} m²
      </Text>

      <View className="p-3 rounded-2xl border mt-5">
        <Text>{t('coordinates')}</Text>
        {coords.map((item, index) => (
          <Text key={index} className="mb-1">
            Lat: {item.latitude}, Lng: {item.longitude}
          </Text>
        ))}
      </View>

      <TouchableOpacity
        className="w-full h-[48] bg-[#229B13] flex items-center justify-center rounded-2xl mt-10"
        onPress={handleStartInspection}
      >
        {loading ? (
          <ActivityIndicator color="white" size={30} />
        ) : (
          <Text className="font-semibold text-white">
            {t('startInspection')}
          </Text>
        )}
      </TouchableOpacity>
    </Screen>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    height: 300,
    width: '100%',
    marginTop: 20,
  },
});
