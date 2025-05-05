import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../../components/Screen/Screen';
import { useTranslation } from 'react-i18next';
import { Camera, MapView, PointAnnotation, StyleURL } from '@rnmapbox/maps';
import { useInspectionContext } from '../../../hooks/useInspectionContext';
import { Polyline } from '../../../components/Map/Polyline';
import {
  BiodiversityDBProps,
  SamplingDBProps,
  TreeDBProps,
} from '../../../types/database';
import { useSQLite } from '../../../hooks/useSQLite';
import { CoordinateProps } from '../../../types/regenerator';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { InspectionStackParamsList } from '../../../routes/InspectionRoutes';
import { Position } from '@rnmapbox/maps/lib/typescript/src/types/Position';
import { RegisterItem } from '../RealizeInspectionScreen/components/RegisterItem';

type ScreenProps = NativeStackScreenProps<
  InspectionStackParamsList,
  'ReportScreen'
>;
export function ReportScreen({ route }: ScreenProps) {
  const { collectionMethod } = route.params;
  const {
    fetchBiodiversityByAreaId,
    db,
    fetchSampligsArea,
    fetchTreesSampling,
  } = useSQLite();
  const { areaOpened } = useInspectionContext();
  const { t } = useTranslation();
  const [pathPolyline, setPathPolyline] = useState<[number, number][]>([]);
  const [biodiversity, setBiodiversity] = useState<BiodiversityDBProps[]>([]);
  const [samplings, setSamplings] = useState<SamplingDBProps[]>([]);
  const [trees, setTrees] = useState<TreeDBProps[]>([]);
  const [coordinateMapCenter, setCoordinateMapCenter] = useState<Position>([
    -46.62714425279819, -23.576845138073693,
  ]);

  useEffect(() => {
    if (db) {
      fetchAreaData();
      handleFetchBiodiversity();
      handleFetchSamplings();
    }
  }, [areaOpened, db]);

  useEffect(() => {
    handleFetchTrees();
  }, [samplings]);

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
  }

  async function handleFetchBiodiversity() {
    if (!areaOpened) return;
    const bios = await fetchBiodiversityByAreaId(areaOpened?.id);
    setBiodiversity(bios);
  }

  async function handleFetchSamplings() {
    if (!areaOpened) return;

    const responseSamplings = await fetchSampligsArea(areaOpened?.id);
    setSamplings(responseSamplings);
  }

  async function handleFetchTrees() {
    if (samplings.length === 0) return;

    if (collectionMethod === 'manual') {
      const responseTrees = await fetchTreesSampling(samplings[0].id);
      setTrees(responseTrees);
    }
  }

  return (
    <Screen
      screenTitle={t('report')}
      showBackButton
      scrollable
    >
      <Text className="font-bold text-black text-lg mt-5">{t('finalResult')}</Text>
      <Text>{areaOpened?.name}</Text>

      <MapView style={styles.mapContainer} styleURL={StyleURL.SatelliteStreet}>
        <Camera centerCoordinate={coordinateMapCenter} zoomLevel={16} />

        <Polyline lineColor="red" lineWidth={4} coordinates={pathPolyline} />

        {biodiversity.map((item, index) => (
          <PointAnnotation
            id="bio-marker"
            key={index.toString()}
            coordinate={[
              JSON.parse(item.coordinate).longitude,
              JSON.parse(item.coordinate).latitude,
            ]}
            children={<View />}
          />
        ))}

        {trees.map((item, index) => (
          <PointAnnotation
            id="tree-marker"
            key={index.toString()}
            coordinate={[
              JSON.parse(item.coordinate).longitude,
              JSON.parse(item.coordinate).latitude,
            ]}
            children={
              <View className="w-2 h-2 bg-white rounded-full border-[1]" />
            }
          />
        ))}
      </MapView>

      <View className="flex-row items-center justify-center mt-5">
        <View className="w-[48%] h-20 rounded-2xl items-center justify-center bg-gray-200">
          <Text className="font-bold text-black text-4xl">{trees.length}</Text>
          <Text>{t('trees')}</Text>
        </View>

        <View className="w-[48%] h-20 rounded-2xl items-center justify-center bg-gray-200 ml-3">
          <Text className="font-bold text-black text-4xl">
            {biodiversity.length}
          </Text>
          <Text>{t('species')}</Text>
        </View>
      </View>

      <Text className="text-green-500 font-bold text-lg mt-10">
        {t('biodiversity')}
      </Text>
      {biodiversity.map((item, index) => (
        <RegisterItem key={index} biodiversity={item} />
      ))}

      <Text className="text-green-500 font-bold text-lg mt-10">
        {t('trees')}
      </Text>
      {trees.map((item, index) => (
        <RegisterItem key={index} tree={item} />
      ))}

      <View className="mb-20" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    width: '100%',
    height: 300,
    marginTop: 20,
  },
});
