import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';
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
import { generateReportPDF } from '../../../services/inspection/generateReportPDF';
import { convertImageToBase64 } from '../../../services/inspection/convertImageToBase64';

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
  const [coordinatesArea, setCoordinatesArea] = useState<CoordinateProps[]>([]);
  const [areaSize, setAreaSize] = useState<number>(0);
  const [pathPolyline, setPathPolyline] = useState<[number, number][]>([]);
  const [biodiversity, setBiodiversity] = useState<BiodiversityDBProps[]>([]);
  const [samplings, setSamplings] = useState<SamplingDBProps[]>([]);
  const [trees, setTrees] = useState<TreeDBProps[]>([]);
  const [coordinateMapCenter, setCoordinateMapCenter] = useState<Position>([
    -46.62714425279819, -23.576845138073693,
  ]);
  const viewMapRef = useRef<ViewShot>(null);
  const [loadingShare, setLoadingShare] = useState(false);
  const [loadingAreaData, setLoadingAreaData] = useState(true);
  const [loadingBio, setLoadingBio] = useState(true);
  const [loadingTrees, setLoadingTrees] = useState(true);
  const [loadingSamplings, setLoadingSamplings] = useState(true);

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
    setLoadingAreaData(true);
    setAreaSize(areaOpened?.size);

    const coords = JSON.parse(areaOpened.coordinates) as CoordinateProps[];
    setCoordinatesArea(coords);
    setCoordinateMapCenter([
      parseFloat(coords[0].longitude),
      parseFloat(coords[0].latitude),
    ]);
    setPathPolyline(
      coords.map(coord => [
        parseFloat(coord.longitude),
        parseFloat(coord.latitude),
      ]),
    );
    setPathPolyline(value => [...value, value[0]]);
    setLoadingAreaData(false);
  }

  async function handleFetchBiodiversity() {
    if (!areaOpened) return;
    setLoadingBio(true);
    const bios = await fetchBiodiversityByAreaId(areaOpened?.id);
    setBiodiversity(bios);
    setLoadingBio(false);
  }

  async function handleFetchSamplings() {
    if (!areaOpened) return;
    setLoadingSamplings(true);
    const responseSamplings = await fetchSampligsArea(areaOpened?.id);
    setSamplings(responseSamplings);
    setLoadingSamplings(false);
  }

  async function handleFetchTrees() {
    if (samplings.length === 0) return;
    setLoadingTrees(true);
    if (collectionMethod === 'manual') {
      const responseTrees = await fetchTreesSampling(samplings[0].id);
      setTrees(responseTrees);
    }
    setLoadingTrees(false);
  }

  async function generatePDF(): Promise<string> {
    const newListBio: BiodiversityDBProps[] = [];
    const newListTrees: TreeDBProps[] = [];

    for (let b = 0; b < biodiversity.length; b++) {
      const bio = biodiversity[b];
      const photo = bio.photo;
      const base64 = await convertImageToBase64(photo);
      newListBio.push({
        ...bio,
        photo: base64,
      });
    }

    for (let t = 0; t < trees.length; t++) {
      const tree = trees[t];
      const photo = tree.photo;
      const base64 = await convertImageToBase64(photo);
      newListTrees.push({
        ...tree,
        photo: base64,
      });
    }

    const mapPhoto = await getMapScreenshot();

    const pdfUri = await generateReportPDF({
      areaName: areaOpened?.name as string,
      biodiversityCount: biodiversity.length,
      treesCount: trees.length,
      biodiversity: newListBio,
      trees: newListTrees,
      mapPhoto,
      coordinates: coordinatesArea,
      areaSize: `${Intl.NumberFormat('pt-BR').format(areaSize)} m²`,
    });

    return pdfUri;
  }

  async function getMapScreenshot() {
    if (!viewMapRef) return '';

    //@ts-ignore
    const shotMapUri = await viewMapRef?.current?.capture();
    const shotMapBase64 = await convertImageToBase64(shotMapUri as string);
    return shotMapBase64;
  }

  async function handleSharePDF() {
    setLoadingShare(true);

    const pdf = await generatePDF();
    Share.open({
      url: pdf,
      title: `Inspection Area: ${areaOpened?.name}`,
      type: 'application/pdf',
    });
    
    setLoadingShare(false);
  }

  if (loadingAreaData || loadingBio || loadingSamplings || loadingTrees) {
    return (
      <Screen screenTitle={t('report')} showBackButton>
        <View className="absolute w-screen h-screen items-center justify-center">
          <ActivityIndicator size={50} />
        </View>
      </Screen>
    )
  }

  return (
    <Screen screenTitle={t('report')} showBackButton scrollable>
      <Text className="font-bold text-black text-lg mt-5">
        {t('finalResult')}
      </Text>
      <Text>{areaOpened?.name}</Text>

      <View className="items-end w-full">
        <TouchableOpacity
          onPress={handleSharePDF}
          className="h-10 w-32 rounded-2xl bg-green-600 flex-row items-center justify-center"
          disabled={loadingShare}
          style={{ opacity: loadingShare ? 0.5 : 1 }}
        >
          <Text className="font-semibold text-white">{t('sharePDF')}</Text>
        </TouchableOpacity>
      </View>

      <ViewShot
        ref={viewMapRef}
        options={{
          fileName: `mapshot-${areaOpened?.name}`,
          format: 'png',
          quality: 0.8,
        }}
      >
        <MapView
          style={styles.mapContainer}
          styleURL={StyleURL.SatelliteStreet}
        >
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
      </ViewShot>

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
