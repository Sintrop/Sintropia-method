import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
  MapView,
  StyleURL,
  UserLocation,
  UserTrackingMode,
} from '@rnmapbox/maps';
import { useFocusEffect } from '@react-navigation/native';
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
import { useLocation } from '../../../hooks/useLocation';
import { isPointInPolygon } from '../../../services/inspection/isPointInPolygon';
import { isPointInCircle } from '../../../services/inspection/isPointInCircle';
import { SamplingIndicator } from './components/SamplingIndicator/SamplingIndicator';
import { OutsideTheCollectionArea } from './components/OutsideTheCollectionArea';
import { Subtitle } from './components/Subtitle';
import { useSafeAreaApp } from '../../../hooks/useSafeAreaApp';
import { TreesAndBiodiversityMarkers } from '../../../components/Map/RegisterMarkers';
import { SamplingCircles } from '../../../components/Map/SamplingCircles';
import { boundsOf, parseStoredCoordinate } from '../../../utils/geo';

type ScreenProps = NativeStackScreenProps<
  InspectionStackParamsList,
  'RealizeInspectionScreen'
>;
export function RealizeInspectionScreen({ route }: ScreenProps) {
  const { top, bottom } = useSafeAreaApp();
  const { collectionMethod, sampling, collectOnlyBio } = route.params;
  const {
    fetchBiodiversityByAreaId,
    addBiodiversity,
    db,
    fetchTreesSampling,
    fetchTreesByAreaId,
    fetchSampligsArea,
    addTree,
  } = useSQLite();
  const { location } = useLocation();
  const { width, height } = useWindowDimensions();
  const { t } = useTranslation();
  const { areaOpened } = useInspectionContext();
  const [pathPolyline, setPathPolyline] = useState<[number, number][]>([]);
  const [biodiversity, setBiodiversity] = useState<BiodiversityDBProps[]>([]);
  const [trees, setTrees] = useState<TreeDBProps[]>([]);
  const [areaTrees, setAreaTrees] = useState<TreeDBProps[]>([]);
  const [samplings, setSamplings] = useState<SamplingDBProps[]>([]);
  const [disableRegisterBio, setDisableRegisterBio] = useState(false);
  const [disableRegisterTree, setDisableRegisterTree] = useState(false);
  const [followUser, setFollowUser] = useState(true);

  const centerSampling = parseStoredCoordinate(sampling.coordinate) ?? [0, 0];
  const highlightedSamplingId =
    collectionMethod === 'sampling' && !collectOnlyBio
      ? sampling.id
      : undefined;

  const cameraRef = useRef<Camera>(null);
  const areaBounds = useMemo(() => boundsOf(pathPolyline), [pathPolyline]);

  const [wholeAreaRequest, setWholeAreaRequest] = useState(0);

  function showWholeArea() {
    setFollowUser(false);
    setWholeAreaRequest(value => value + 1);
  }

  useEffect(() => {
    if (wholeAreaRequest === 0 || followUser || !areaBounds) return;
    // The map is as tall as the window but starts below the header, and the
    // overlays cover its top and bottom, so the padding keeps the area visible.
    cameraRef.current?.fitBounds(
      areaBounds.ne,
      areaBounds.sw,
      [190, 30, 300 + top + bottom, 30],
      600,
    );
  }, [wholeAreaRequest, followUser, areaBounds, top, bottom]);

  useEffect(() => {
    if (db) {
      fetchAreaData();
    }
  }, [areaOpened, db]);

  useFocusEffect(
    useCallback(() => {
      if (db) {
        handleFetchBiodiversity();
        handleFetchTrees();
        handleFetchSamplings();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [areaOpened, db]),
  );

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

    if (areaOpened) {
      setAreaTrees(await fetchTreesByAreaId(areaOpened.id));
    }
  }

  async function handleFetchSamplings() {
    if (!areaOpened || collectionMethod !== 'sampling') return;
    setSamplings(await fetchSampligsArea(areaOpened.id));
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
    <View style={{ paddingTop: top, position: 'relative' }}>
      <Header screenTitle={t('realizeInspection')} showBackButton />
      <View style={{ position: 'relative' }}>
        <View className="absolute top-9 left-0 w-full px-5 z-20">
          {collectionMethod === 'sampling' && !collectOnlyBio && (
            <SamplingIndicator samplingNumber={sampling.number} />
          )}

          <View className="flex-row items-start justify-between">
            <Subtitle />

            <View className="mt-3">
              <MapModeButton
                label={t('map.myLocation')}
                active={followUser}
                onPress={() => setFollowUser(true)}
              />
              <MapModeButton
                label={t('map.wholeArea')}
                active={!followUser}
                onPress={showWholeArea}
              />
            </View>
          </View>

          {collectOnlyBio ? (
            <OutsideTheCollectionArea outside={disableRegisterBio} />
          ) : (
            <OutsideTheCollectionArea outside={disableRegisterTree} />
          )}
        </View>

        <MapView
          style={[styles.mapContainer, { width, height }]}
          styleURL={StyleURL.SatelliteStreet}
          onTouchStart={() => setFollowUser(false)}
        >
          <Camera
            ref={cameraRef}
            followUserLocation={followUser}
            followUserMode={UserTrackingMode.Follow}
            followZoomLevel={18}
          />

          <UserLocation showsUserHeadingIndicator minDisplacement={1} />

          <Polyline
            id="area"
            lineColor="red"
            lineWidth={4}
            coordinates={pathPolyline}
          />

          {collectionMethod === 'sampling' && (
            <SamplingCircles
              samplings={samplings}
              highlightedId={highlightedSamplingId}
            />
          )}

          <TreesAndBiodiversityMarkers
            trees={collectOnlyBio ? [] : areaTrees}
            biodiversity={biodiversity}
          />
        </MapView>

        <View
          style={{
            position: 'absolute',
            top: height - 250 - bottom,
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

interface MapModeButtonProps {
  label: string;
  active: boolean;
  onPress: () => void;
}
function MapModeButton({ label, active, onPress }: MapModeButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`rounded-2xl px-3 py-2 mb-2 ${
        active ? 'bg-green-600' : 'bg-white'
      }`}
    >
      <Text
        className={`text-xs font-semibold ${
          active ? 'text-white' : 'text-black'
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    position: 'absolute',
    flex: 1,
  },
});
