import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { Screen } from '../../../components/Screen/Screen';
import { HeaderInspectionMode } from '../components/HeaderInspectionMode';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { InspectionStackParamsList } from '../../../routes/InspectionRoutes';
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
import {
  ModalRegisterItem,
  RegisterItemProps,
} from './components/ModalRegisterItem/ModalRegisterItem';
import { BiodiversityList } from './components/BiodiversityList/BiodiversityList';
import { Header } from '../../../components/Header/Header';

type ScreenProps = NativeStackScreenProps<
  InspectionStackParamsList,
  'RealizeInspectionScreen'
>;
export function RealizeInspectionScreen({ route }: ScreenProps) {
  const { width, height } = useWindowDimensions();
  const { t } = useTranslation();
  const { areaOpened } = useInspectionContext();
  const { fetchBiodiversityByAreaId, addBiodiversity } = useSQLite();
  const [pathPolyline, setPathPolyline] = useState<[number, number][]>([]);
  const [biodiversity, setBiodiversity] = useState<BiodiversityDBProps[]>([]);

  useEffect(() => {
    fetchAreaData();
  }, [areaOpened]);

  async function fetchAreaData() {
    if (!areaOpened) return;
    const coords = JSON.parse(areaOpened.coordinates) as CoordinateProps[];
    setPathPolyline(
      coords.map(coord => [
        parseFloat(coord.longitude),
        parseFloat(coord.latitude),
      ]),
    );
    setPathPolyline(value => [...value, value[0]]);
    handleFetchBiodiversity();
  }

  async function handleFetchBiodiversity() {
    if (!areaOpened?.id) return;
    const bios = await fetchBiodiversityByAreaId(areaOpened.id);
    setBiodiversity(bios);
  }

  async function handleRegisterItem(data: RegisterItemProps): Promise<void> {
    if (!areaOpened) return;

    if (data?.registerType === 'biodiversity') {
      await addBiodiversity({
        areaId: areaOpened?.id,
        coordinate: JSON.stringify(data?.coordinate),
        photo: data.photo,
        specieData: data.specieData,
      });

      handleFetchBiodiversity();
    }
  }

  return (
    <View>
      <Header screenTitle={t('realizeInspection')} showBackButton />
      <View style={{ position: 'relative' }}>
        <MapView
          style={[styles.mapContainer, { width, height }]}
          styleURL={StyleURL.SatelliteStreet}
        >
          <Camera
            followUserLocation={true}
            followUserMode={UserTrackingMode.Follow}
            followZoomLevel={16}
          />

          <UserLocation showsUserHeadingIndicator minDisplacement={1} />

          <Polyline lineColor="red" lineWidth={4} coordinates={pathPolyline} />
        </MapView>

        <View style={{ position: 'absolute', top: height - 230, right: 20 }}>
          <ModalRegisterItem
            registerType="biodiversity"
            count={biodiversity.length}
            registerItem={handleRegisterItem}
          />

          <BiodiversityList list={biodiversity} />
        </View>
      </View>

      {/* <View className="flex-row items-center w-full mt-5 mb-5">
          <TouchableOpacity className="w-[48%] h-24 rounded-2xl bg-gray-300 items-center justify-center">
            <Text>{t('trees')}</Text>
            <Text className="font-bold text-black text-3xl">0</Text>
            <Text className="text-xs">{t('touchHereToRegister')}</Text>
          </TouchableOpacity>

          <ModalRegisterItem
            registerType="biodiversity"
            count={biodiversity.length}
            registerItem={handleRegisterItem}
          />
        </View>

        <BiodiversityList list={biodiversity} /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    position: 'absolute',
    flex: 1,
  },
});
