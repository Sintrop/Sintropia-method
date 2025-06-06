import React, { useEffect, useState } from 'react';
import {
  Alert,
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
  FillLayer,
  MapView,
  PointAnnotation,
  ShapeSource,
  StyleURL,
  UserLocation,
  UserTrackingMode,
} from '@rnmapbox/maps';
import { useInspectionContext } from '../../../hooks/useInspectionContext';
import { CoordinateProps } from '../../../types/regenerator';
import { Polyline } from '../../../components/Map/Polyline';
import { useSQLite } from '../../../hooks/useSQLite';
import { BiodiversityDBProps, TreeDBProps } from '../../../types/database';
import {
  ModalRegisterItem,
  RegisterItemProps,
} from './components/ModalRegisterItem/ModalRegisterItem';
import { BiodiversityList } from './components/BiodiversityList/BiodiversityList';
import { Header } from '../../../components/Header/Header';
import { TreesList } from './components/TreesList/TreesList';
import { Icon } from '../../../components/Icon/Icon';
import { circle } from '@turf/turf';
import { useLocation } from '../../../hooks/useLocation';
import { isPointInPolygon } from '../../../services/inspection/isPointInPolygon';
import { isPointInCircle } from '../../../services/inspection/isPointInCircle';
import { SamplingIndicator } from './components/SamplingIndicator/SamplingIndicator';
import { OutsideTheCollectionArea } from './components/OutsideTheCollectionArea';
import { Subtitle } from './components/Subtitle';

type ScreenProps = NativeStackScreenProps<
  InspectionStackParamsList,
  'RealizeInspectionScreen'
>;
export function RealizeInspectionScreen({ route }: ScreenProps) {
  const { collectionMethod, sampling, collectOnlyBio } = route.params;
  const {
    fetchBiodiversityByAreaId,
    addBiodiversity,
    db,
    fetchTreesSampling,
    addTree,
  } = useSQLite();
  const { location } = useLocation();
  const { width, height } = useWindowDimensions();
  const { t } = useTranslation();
  const { areaOpened } = useInspectionContext();
  const [pathPolyline, setPathPolyline] = useState<[number, number][]>([]);
  const [biodiversity, setBiodiversity] = useState<BiodiversityDBProps[]>([]);
  const [trees, setTrees] = useState<TreeDBProps[]>([]);
  const [disableRegisterBio, setDisableRegisterBio] = useState(false);
  const [disableRegisterTree, setDisableRegisterTree] = useState(false);

  const centerSampling =
    sampling.coordinate !== ''
      ? [
          JSON.parse(sampling.coordinate).longitude,
          JSON.parse(sampling.coordinate).latitude,
        ]
      : [0, 0];

  const circleGeoJSON = circle(centerSampling, sampling.size, {
    steps: 64,
    units: 'meters',
  });

  useEffect(() => {
    if (db) {
      fetchAreaData();
      handleFetchBiodiversity();
      handleFetchTrees();
    }
  }, [areaOpened, db]);

  useEffect(() => {
    handleCheckAvailableCollect();
  }, [location]);

  function handleCheckAvailableCollect() {
    if (!location) return;

    const atualPosition = location.coords;

    const pointInPolygon = isPointInPolygon({
      coord: {
        latitude: atualPosition.latitude,
        longitude: atualPosition.longitude,
      },
      polygonCoords: pathPolyline,
    });

    setDisableRegisterBio(!pointInPolygon);

    if (collectionMethod === 'manual') {
      setDisableRegisterTree(!pointInPolygon);
    }

    if (collectionMethod === 'sampling') {
      const isPointInSampling = isPointInCircle({
        center: { latitude: centerSampling[1], longitude: centerSampling[0] },
        point: {
          latitude: atualPosition.latitude,
          longitude: atualPosition.longitude,
        },
        radiusInMeters: sampling.size,
      });

      setDisableRegisterTree(!isPointInSampling);
    }
  }

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

  async function handleFetchTrees() {
    const responseTrees = await fetchTreesSampling(sampling.id);
    setTrees(responseTrees);
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
      await addTree({
        areaId,
        coordinate,
        photo,
        specieData,
        samplingNumber: sampling.number,
        samplingId: sampling.id,
      });

      if (data.addNewBio) {
        await addBiodiversity({
          areaId,
          coordinate,
          photo,
          specieData,
        });

        handleFetchBiodiversity();
      }

      handleFetchTrees();
    }
  }

  return (
    <View>
      <Header screenTitle={t('realizeInspection')} showBackButton />
      <View style={{ position: 'relative' }}>
        <View className="absolute top-9 left-0 w-full px-5 z-20">
          {collectionMethod === 'sampling' && !collectOnlyBio && (
            <SamplingIndicator samplingNumber={sampling.number} />
          )}

          <Subtitle />

          {collectOnlyBio ? (
            <OutsideTheCollectionArea outside={disableRegisterBio} />
          ) : (
            <OutsideTheCollectionArea outside={disableRegisterTree} />
          )}
        </View>

        <MapView
          style={[styles.mapContainer, { width, height }]}
          styleURL={StyleURL.SatelliteStreet}
        >
          <Camera
            followUserLocation={true}
            followUserMode={UserTrackingMode.Follow}
            followZoomLevel={18}
          />

          <UserLocation showsUserHeadingIndicator minDisplacement={1} />

          <Polyline lineColor="red" lineWidth={4} coordinates={pathPolyline} />

          {!collectOnlyBio && (
            <>
              {trees.map((item, index) => (
                <PointAnnotation
                  id="tree-marker"
                  key={index.toString()}
                  coordinate={[
                    JSON.parse(item.coordinate).longitude,
                    JSON.parse(item.coordinate).latitude,
                  ]}
                  children={
                    <View className="w-5 h-5 bg-green-500 rounded-full border border-black" />
                  }
                />
              ))}

              {collectionMethod === 'sampling' && (
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
            </>
          )}

          {biodiversity.map((item, index) => (
            <PointAnnotation
              id="bio-marker"
              key={index.toString()}
              coordinate={[
                JSON.parse(item.coordinate).longitude,
                JSON.parse(item.coordinate).latitude,
              ]}
              children={
                <View className="w-3 h-3 bg-yellow-500 rounded-full border border-black" />
              }
            />
          ))}
        </MapView>

        <View
          style={{
            position: 'absolute',
            top: height - 220,
            right: 20,
            alignItems: 'flex-end',
          }}
        >
          {collectOnlyBio ? (
            <ModalRegisterItem
              registerType="biodiversity"
              registerItem={handleRegisterItem}
              disabled={disableRegisterBio}
              location={location}
            />
          ) : (
            <ModalRegisterItem
              registerType="tree"
              registerItem={handleRegisterItem}
              disabled={disableRegisterTree}
              location={location}
            />
          )}

          <View className="flex-row">
            {!collectOnlyBio && (
              <TreesList list={trees} updateList={handleFetchTrees} />
            )}
            <BiodiversityList
              list={biodiversity}
              updateList={handleFetchBiodiversity}
            />
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
