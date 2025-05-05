import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
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
import {
  BiodiversityDBProps,
  SamplingDBProps,
  TreeDBProps,
} from '../../../types/database';
import {
  ModalRegisterItem,
  RegisterItemProps,
} from './components/ModalRegisterItem/ModalRegisterItem';
import { BiodiversityList } from './components/BiodiversityList/BiodiversityList';
import { Header } from '../../../components/Header/Header';
import { TreesList } from './components/TreesList/TreesList';
import { Icon } from '../../../components/Icon/Icon';

type ScreenProps = NativeStackScreenProps<
  InspectionStackParamsList,
  'RealizeInspectionScreen'
>;
export function RealizeInspectionScreen({ route, navigation }: ScreenProps) {
  const { collectionMethod } = route.params;
  const {
    fetchBiodiversityByAreaId,
    addBiodiversity,
    db,
    fetchSampligsArea,
    addSampling,
    fetchTreesSampling,
    addTree,
  } = useSQLite();
  const { width, height } = useWindowDimensions();
  const { t } = useTranslation();
  const { areaOpened } = useInspectionContext();
  const [pathPolyline, setPathPolyline] = useState<[number, number][]>([]);
  const [biodiversity, setBiodiversity] = useState<BiodiversityDBProps[]>([]);
  const [samplings, setSamplings] = useState<SamplingDBProps[]>([]);
  const [trees, setTrees] = useState<TreeDBProps[]>([]);

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

    if (collectionMethod === 'manual') {
      startManualMode(responseSamplings);
    }
  }

  async function startManualMode(samps: SamplingDBProps[]): Promise<void> {
    if (!areaOpened) return;
    if (samps.length > 0) return;

    await addSampling({
      areaId: areaOpened?.id,
      number: 1,
      size: areaOpened?.size,
      coordinate: ''
    });

    handleFetchSamplings();
  }

  async function handleFetchTrees() {
    if (samplings.length === 0) return;

    if (collectionMethod === 'manual') {
      const responseTrees = await fetchTreesSampling(samplings[0].id);
      setTrees(responseTrees);
    }
  }

  async function handleRegisterItem(data: RegisterItemProps): Promise<void> {
    if (!areaOpened) return;
    const areaId = areaOpened?.id;
    const coordinate = JSON.stringify(data?.coordinate);
    const photo = data?.photo;
    const specieData = data?.specieData;

    if (data?.registerType === 'biodiversity') {
      await addBiodiversity({
        areaId,
        coordinate,
        photo,
        specieData,
      });

      handleFetchBiodiversity();
    }

    if (data?.registerType === 'tree') {
      if (collectionMethod === 'manual') {
        await addTree({
          areaId,
          coordinate,
          photo,
          specieData,
          samplingNumber: 1,
          samplingId: samplings[0].id,
        });

        handleFetchTrees();
      }
    }
  }

  function handleGoToReport(): void {
    navigation.navigate("ReportScreen");
  }

  return (
    <View>
      <Header screenTitle={t('realizeInspection')} showBackButton />
      <View style={{ position: 'relative' }}>
        <View
          style={{
            position: 'absolute',
            top: 25,
            right: 25,
            zIndex: 20
          }}
        >
          <TouchableOpacity
            className="bg-gray-200 rounded-2xl h-10 pl-5 pr-2 flex-row items-center justify-center"
            onPress={handleGoToReport}
          >
            <Text className="text-black mr-2">{t('report')}</Text>
            <Icon name="chevronRight" size={25}/>
          </TouchableOpacity>
        </View>
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
              children={<View className="w-2 h-2 bg-white rounded-full border-[1]"/>}
            />
          ))}
        </MapView>

        <View
          style={{
            position: 'absolute',
            top: height - 230,
            right: 20,
            flexDirection: 'row',
          }}
        >
          <View className="mr-5">
            <ModalRegisterItem
              registerType="tree"
              count={trees.length}
              registerItem={handleRegisterItem}
            />

            <TreesList list={trees} />
          </View>

          <View>
            <ModalRegisterItem
              registerType="biodiversity"
              count={biodiversity.length}
              registerItem={handleRegisterItem}
            />

            <BiodiversityList list={biodiversity} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    position: 'absolute',
    flex: 1,
  },
});
