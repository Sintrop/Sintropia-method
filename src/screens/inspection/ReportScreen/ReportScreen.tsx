import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';
import { Screen } from '../../../components/Screen/Screen';
import { useTranslation } from 'react-i18next';
import { Camera, MapView, PointAnnotation, StyleURL } from '@rnmapbox/maps';
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
import { generateReportPDF } from '../../../services/inspection/generateReportPDF';
import { convertImageToBase64 } from '../../../services/inspection/convertImageToBase64';
import { BiodiversityList } from './components/BiodiversityList/BiodiversityList';
import { SamplingList } from './components/SamplingList/SamplingList';
import {
  generateReportPDFSamplingMode,
  SamplingPDFProps,
} from '../../../services/inspection/generateReportPDFSamplingMode';
import { extrapolateTreesToArea } from '../../../services/inspection/extrapolateTreesToArea';
import { Calculation } from './components/Calculation/Calculation';
import { calculateAreaCircle } from '../../../services/inspection/calculateAreaCircle';

export interface TreesPerSamplingProps {
  samplingNumber: number;
  treesCount: number;
}
type ScreenProps = NativeStackScreenProps<
  InspectionStackParamsList,
  'ReportScreen'
>;
export function ReportScreen({ route }: ScreenProps) {
  const { collectionMethod, area } = route.params;
  const {
    fetchBiodiversityByAreaId,
    db,
    fetchSampligsArea,
    fetchTreesSampling,
  } = useSQLite();
  const { t } = useTranslation();
  const [coordinatesArea, setCoordinatesArea] = useState<CoordinateProps[]>([]);
  const [areaSize, setAreaSize] = useState<number>(0);
  const [pathPolyline, setPathPolyline] = useState<[number, number][]>([]);
  const [biodiversity, setBiodiversity] = useState<BiodiversityDBProps[]>([]);
  const [samplings, setSamplings] = useState<SamplingDBProps[]>([]);
  const [samplingSize, setSamplingSize] = useState<number>(0);
  const [trees, setTrees] = useState<TreeDBProps[]>([]);
  const [treesPerSampling, setTreesPerSampling] = useState<
    TreesPerSamplingProps[]
  >([]);
  const [totalTrees, setTotalTrees] = useState<number>(0);
  const [totalBiodiversity, setTotalBiodiversity] = useState<number>(0);
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
      setAreaData();
      handleFetchBiodiversity();
      handleFetchSamplings();
    }
  }, [db]);

  useEffect(() => {
    handleFetchTrees();
  }, [samplings]);

  async function setAreaData() {
    setLoadingAreaData(true);
    setAreaSize(area?.size);

    const coords = JSON.parse(area.coordinates) as CoordinateProps[];
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
    setLoadingBio(true);
    const bios = await fetchBiodiversityByAreaId(area?.id);
    setTotalBiodiversity(bios.length);
    setBiodiversity(bios);
    setLoadingBio(false);
  }

  async function handleFetchSamplings() {
    setLoadingSamplings(true);
    const responseSamplings = await fetchSampligsArea(area?.id);
    setSamplings(responseSamplings);
    setLoadingSamplings(false);
  }

  async function handleFetchTrees() {
    if (samplings.length === 0) return;

    setLoadingTrees(true);
    if (collectionMethod === 'manual') {
      const responseTrees = await fetchTreesSampling(samplings[0].id);
      setTrees(responseTrees);
      setTotalTrees(responseTrees.length);
    }

    if (collectionMethod === 'sampling') {
      setTreesPerSampling([]);
      setSamplingSize(samplings[0].size);
      let treesCountPerSampling: number[] = [];
      for (let s = 0; s < samplings.length; s++) {
        const sampling = samplings[s];
        const responseTrees = await fetchTreesSampling(sampling.id);
        treesCountPerSampling.push(responseTrees.length);

        setTreesPerSampling(value => [
          ...value,
          { samplingNumber: s + 1, treesCount: responseTrees.length },
        ]);
      }

      const treesTotalEstimated = extrapolateTreesToArea({
        samplingSize: samplings[0].size,
        samplingTrees: treesCountPerSampling,
        totalArea: area.size,
      });

      setTotalTrees(treesTotalEstimated);
    }
    setLoadingTrees(false);
  }

  async function generatePDFManualMode(): Promise<string> {
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

    const proofPhoto = await convertImageToBase64(area.proofPhoto);

    const pdfUri = await generateReportPDF({
      areaName: area?.name,
      biodiversityCount: totalBiodiversity,
      treesCount: totalTrees,
      biodiversity: newListBio,
      trees: newListTrees,
      proofPhoto,
      coordinates: coordinatesArea,
      areaSize: `${Intl.NumberFormat('pt-BR').format(areaSize)} m²`,
    });

    return pdfUri;
  }

  async function generatePDFSamplingMode(): Promise<string> {
    const newListBio: BiodiversityDBProps[] = [];
    const newListSamplings: SamplingPDFProps[] = [];

    for (let b = 0; b < biodiversity.length; b++) {
      const bio = biodiversity[b];
      const photo = bio.photo;
      const base64 = await convertImageToBase64(photo);
      newListBio.push({
        ...bio,
        photo: base64,
      });
    }

    for (let s = 0; s < samplings.length; s++) {
      const sampling = samplings[s];
      const trees = await fetchTreesSampling(sampling.id);

      let newTreesList: TreeDBProps[] = [];

      for (let t = 0; t < trees.length; t++) {
        const tree = trees[t];
        const photoBase64 = await convertImageToBase64(tree.photo);
        const newDataTree: TreeDBProps = {
          ...tree,
          photo: photoBase64,
        };
        newTreesList.push(newDataTree);
      }

      const newDataSampling: SamplingPDFProps = {
        samplingNumber: sampling.number,
        size: sampling.size,
        trees: newTreesList,
      };

      newListSamplings.push(newDataSampling);
    }

    const proofPhoto = await convertImageToBase64(area.proofPhoto);

    const pdfUri = await generateReportPDFSamplingMode({
      areaName: area?.name,
      biodiversityCount: totalBiodiversity,
      treesCount: totalTrees,
      biodiversity: newListBio,
      samplings: newListSamplings,
      proofPhoto,
      coordinates: coordinatesArea,
      areaSize: `${Intl.NumberFormat('pt-BR').format(areaSize)} m²`,
    });

    return pdfUri;
  }

  async function handleSharePDF() {
    setLoadingShare(true);

    if (collectionMethod === 'manual') {
      const pdf = await generatePDFManualMode();
      Share.open({
        url: pdf,
        title: `Inspection Area: ${area?.name}`,
        type: 'application/pdf',
      });
    }

    if (collectionMethod === 'sampling') {
      const pdf = await generatePDFSamplingMode();
      Share.open({
        url: pdf,
        title: `Inspection Area: ${area?.name}`,
        type: 'application/pdf',
      });
    }

    setLoadingShare(false);
  }

  if (loadingAreaData || loadingBio || loadingSamplings || loadingTrees) {
    return (
      <Screen screenTitle={t('report')} showBackButton>
        <View className="absolute w-screen h-screen items-center justify-center">
          <ActivityIndicator size={50} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen screenTitle={t('report')} showBackButton scrollable>
      <Text className="font-bold text-black text-lg mt-5">
        {t('finalResult')}
      </Text>
      <Text>{area?.name}</Text>

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
          fileName: `mapshot-${area?.name}`,
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
              children={
                <View className="w-3 h-3 bg-yellow-500 rounded-full border border-black" />
              }
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
                <View className="w-5 h-5 bg-green-500 rounded-full border border-black" />
              }
            />
          ))}
        </MapView>
      </ViewShot>

      <Text className="mt-3">
        {t('areaSize')}: {Intl.NumberFormat('pt-BR').format(area.size)} m²
      </Text>

      {collectionMethod === 'sampling' && (
        <>
          <Text>
            {t('samplingRadius')}: {samplingSize} m
          </Text>
          <Text>
            {t('samplingArea')}: {calculateAreaCircle(samplingSize)} m²
          </Text>
          {treesPerSampling.map((item, index) => (
            <Text key={index}>
              {t('numberOfTreesInTheSampling')} {item.samplingNumber}:{' '}
              {item.treesCount}
            </Text>
          ))}
        </>
      )}

      <View className="flex-row items-center justify-center mt-5">
        <View className="w-[48%] h-20 rounded-2xl items-center justify-center bg-gray-200">
          <Text className="font-bold text-black text-4xl">{totalTrees}</Text>
          <Text>{t('trees')}</Text>
        </View>

        <View className="w-[48%] h-20 rounded-2xl items-center justify-center bg-gray-200 ml-3">
          <Text className="font-bold text-black text-4xl">
            {totalBiodiversity}
          </Text>
          <Text>{t('biodiversity')}</Text>
        </View>
      </View>

      {collectionMethod === 'sampling' && <Calculation />}

      <BiodiversityList list={biodiversity} />

      <SamplingList samplings={samplings} collectionMethod={collectionMethod} />

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
