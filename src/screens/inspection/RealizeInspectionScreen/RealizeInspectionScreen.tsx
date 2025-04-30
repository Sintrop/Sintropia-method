import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Screen } from '../../../components/Screen/Screen';
import { HeaderInspectionMode } from '../components/HeaderInspectionMode';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { InspectionStackParamsList } from '../../../routes/InspectionRoutes';
import { useLocation } from '../../../hooks/useLocation';
import {
  Camera,
  MapView,
  PointAnnotation,
  StyleURL,
  UserLocation,
  UserTrackingMode,
} from '@rnmapbox/maps';
import { useInspectionContext } from '../../../hooks/useInspectionContext';
import { CoordinateProps } from '../../../types/regenerator';
import { Polyline } from '../../../components/Map/Polyline';
import { useSQLite } from '../../../hooks/useSQLite';
import { BiodiversityDBProps } from '../../../types/database';

type ScreenProps = NativeStackScreenProps<
  InspectionStackParamsList,
  'RealizeInspectionScreen'
>;
export function RealizeInspectionScreen({ route }: ScreenProps) {
  const { t } = useTranslation();
  const { areaOpened } = useInspectionContext();
  const { location } = useLocation();
  const {fetchBiodiversityByAreaId} = useSQLite();
  const [pathPolyline, setPathPolyline] = useState<[number, number][]>([]);
  const [biodiversity, setBiodiversity] = useState<BiodiversityDBProps[]>([]);

  useEffect(() => {
    fetchAreaData();
  }, [areaOpened])

  async function fetchAreaData() {
    if (!areaOpened) return
    const coords = JSON.parse(areaOpened.coordinates) as CoordinateProps[];
    setPathPolyline(coords.map(coord => [
      parseFloat(coord.longitude),
      parseFloat(coord.latitude),
    ]));
    setPathPolyline((value) => [...value, value[0]])
    
    handleFetchBiodiversity();
  }

  async function handleFetchBiodiversity() {
    if (!areaOpened) return
    const bios = await fetchBiodiversityByAreaId(areaOpened.id);
    setBiodiversity(bios)
  }

  return (
    <Screen screenTitle={t('realizeInspection')} showBackButton>
      <HeaderInspectionMode />

      <MapView style={styles.mapContainer} styleURL={StyleURL.SatelliteStreet}>
        <Camera
          followUserLocation={true}
          followUserMode={UserTrackingMode.Follow}
          followZoomLevel={16}
        />

        <UserLocation
          showsUserHeadingIndicator
          minDisplacement={1}
        />

        <Polyline lineColor="red" lineWidth={4} coordinates={pathPolyline} />
      </MapView>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center w-full mt-5">
          <TouchableOpacity className="w-[48%] h-24 rounded-2xl bg-gray-300 items-center justify-center">
            <Text>{t('trees')}</Text>
            <Text className="font-bold text-black text-3xl">0</Text>
            <Text className="text-xs">{t('touchHereToRegister')}</Text>
          </TouchableOpacity>

          <TouchableOpacity className="w-[48%] h-24 rounded-2xl bg-gray-300 items-center justify-center ml-4">
            <Text>{t('biodiversity')}</Text>
            <Text className="font-bold text-black text-3xl">{biodiversity.length}</Text>
            <Text className="text-xs">{t('touchHereToRegister')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    height: 300,
    width: '100%',
    marginTop: 10
  },
});
