import React, { useMemo, useState } from 'react';
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
  FillLayer,
  MapView,
  ShapeSource,
  StyleURL,
} from '@rnmapbox/maps';
import { Polyline } from '../../../components/Map/Polyline';
import { useInspectionContext } from '../../../hooks/useInspectionContext';
import { useFitBounds } from '../../../hooks/useFitBounds';
import { areaRing, boundsOf } from '../../../utils/geo';
import { shortAddress } from '../RegeneratorsListScreen/components/RegeneratorItem';
import Config from 'react-native-config';

const MAPBOX_ACCESS_TOKEN = Config.MAPBOX_ACCESS_TOKEN
  ? Config.MAPBOX_ACCESS_TOKEN
  : '';
Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

type ScreenProps = NativeStackScreenProps<
  PreInspectionStackParamsList,
  'AreaPreviewScreen'
>;
export function AreaPreviewScreen({ route }: ScreenProps) {
  const { startInspection } = useInspectionContext();
  const { coords, regenerator } = route.params;
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const ring = useMemo(() => areaRing(coords), [coords]);
  const bounds = useMemo(() => boundsOf(ring), [ring]);
  const { cameraRef, onMapLoaded, defaultSettings } = useFitBounds(bounds, 30);

  async function handleStartInspection() {
    setLoading(true);
    await startInspection({
      regenerator: {
        address: regenerator.regeneratorWallet,
        name: regenerator.name,
      },
      coordinates: coords,
      areaSize: regenerator.totalArea,
    });
    setLoading(false);
  }

  return (
    <Screen screenTitle={t('areaPreview')} showBackButton scrollable>
      <Text className="font-bold text-black text-lg mt-5">
        {regenerator.name}
      </Text>
      <Text className="text-gray-500">
        {t('regenerator')} #{regenerator.id} ·{' '}
        {shortAddress(regenerator.regeneratorWallet)}
      </Text>

      <MapView
        style={styles.mapContainer}
        styleURL={StyleURL.SatelliteStreet}
        onDidFinishLoadingMap={onMapLoaded}
      >
        <Camera ref={cameraRef} defaultSettings={defaultSettings} />

        <ShapeSource
          id="area-fill-source"
          shape={{
            type: 'Feature',
            properties: {},
            geometry: { type: 'Polygon', coordinates: [ring] },
          }}
        >
          <FillLayer
            id="area-fill"
            style={{ fillColor: 'rgba(255, 0, 0, 0.15)' }}
          />
        </ShapeSource>

        <Polyline id="area" lineColor="red" lineWidth={4} coordinates={ring} />
      </MapView>

      <Text className="text-gray-500 mt-2">
        {t('areaSize')}:{' '}
        {Intl.NumberFormat('pt-BR').format(regenerator.totalArea)} m²
      </Text>

      <View className="p-3 rounded-2xl border mt-5">
        <Text className="text-gray-500">{t('coordinates')}</Text>
        {coords.map((item, index) => (
          <Text key={index} className="mb-1 text-black">
            Lat: {item.latitude}, Lng: {item.longitude}
          </Text>
        ))}
      </View>

      <TouchableOpacity
        className="w-full h-[48] bg-[#229B13] flex items-center justify-center rounded-2xl my-10"
        onPress={handleStartInspection}
        disabled={loading}
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
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
});
