import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
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
  ProofPhotosDBProps,
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
import { LoadingGeneratingPdf } from './components/LoadingGeneratingPdf/LoadingGeneratingPdf';
import { generateReportProofPhotos } from '../../../services/inspection/generateReportProofPhotos';

//@ts-ignore
import SintropiaLogo from '../../../assets/images/syntropy-method-en.png';
import { format } from 'date-fns';

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
    fetchProofPhotosArea,
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

  const [totalPicturesToPdf, setTotalPicturesToPdf] = useState<number>(1);
  const [percentGeneratingPdf, setPercentGeneratingPdf] = useState<number>(0);
  const [messageGeneratingPdf, setMessageGeneratingPdf] = useState<string>('');

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
    setTotalPicturesToPdf(value => value + bios.length);
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
      setTotalPicturesToPdf(value => value + responseTrees.length);
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
        setTotalPicturesToPdf(value => value + responseTrees.length);
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

    let totalConverted = 0;

    for (let b = 0; b < biodiversity.length; b++) {
      const bio = biodiversity[b];
      const photo = bio.photo;
      const base64 = await convertImageToBase64({ uri: photo });
      newListBio.push({
        ...bio,
        photo: base64,
      });
      totalConverted += 1;
      setPercentGeneratingPdf(
        Math.ceil((totalConverted / totalPicturesToPdf) * 100),
      );
    }

    for (let t = 0; t < trees.length; t++) {
      const tree = trees[t];
      const photo = tree.photo;
      const base64 = await convertImageToBase64({ uri: photo });
      newListTrees.push({
        ...tree,
        photo: base64,
      });
      totalConverted += 1;
      setPercentGeneratingPdf(
        Math.ceil((totalConverted / totalPicturesToPdf) * 100),
      );
    }

    setMessageGeneratingPdf('creatingPDF');

    const pdfUri = await generateReportPDF({
      areaName: area?.name,
      biodiversityCount: totalBiodiversity,
      treesCount: totalTrees,
      biodiversity: newListBio,
      trees: newListTrees,
      coordinates: coordinatesArea,
      areaSize: `${Intl.NumberFormat('pt-BR').format(areaSize)} m²`,
      regenerator: {
        address: area.regeneratorAddress,
      },
      date: format(new Date(), 'dd/MM/yyyy'),
      version: '1',
    });

    return pdfUri;
  }

  async function generatePDFSamplingMode(): Promise<string> {
    const newListBio: BiodiversityDBProps[] = [];
    const newListSamplings: SamplingPDFProps[] = [];

    let totalConverted = 0;

    for (let b = 0; b < biodiversity.length; b++) {
      const bio = biodiversity[b];
      const photo = bio.photo;
      const base64 = await convertImageToBase64({ uri: photo });
      newListBio.push({
        ...bio,
        photo: base64,
      });
      totalConverted += 1;
      setPercentGeneratingPdf(
        Math.ceil((totalConverted / totalPicturesToPdf) * 100),
      );
    }

    for (let s = 0; s < samplings.length; s++) {
      const sampling = samplings[s];
      const trees = await fetchTreesSampling(sampling.id);

      let newTreesList: TreeDBProps[] = [];

      for (let t = 0; t < trees.length; t++) {
        const tree = trees[t];
        const photoBase64 = await convertImageToBase64({ uri: tree.photo });
        const newDataTree: TreeDBProps = {
          ...tree,
          photo: photoBase64,
        };
        newTreesList.push(newDataTree);
        totalConverted += 1;
        setPercentGeneratingPdf(
          Math.ceil((totalConverted / totalPicturesToPdf) * 100),
        );
      }

      const newDataSampling: SamplingPDFProps = {
        samplingNumber: sampling.number,
        size: sampling.size,
        trees: newTreesList,
      };

      newListSamplings.push(newDataSampling);
    }

    setMessageGeneratingPdf('creatingPDF');

    const pdfUri = await generateReportPDFSamplingMode({
      areaName: area?.name,
      biodiversityCount: totalBiodiversity,
      treesCount: totalTrees,
      biodiversity: newListBio,
      samplings: newListSamplings,
      coordinates: coordinatesArea,
      areaSize: `${Intl.NumberFormat('pt-BR').format(areaSize)} m²`,
      regenerator: {
        address: area.regeneratorAddress,
      },
      date: format(new Date(), 'dd/MM/yyyy'),
      version: '1',
    });

    return pdfUri;
  }

  async function handleSharePDF() {
    setLoadingShare(true);
    setMessageGeneratingPdf('optimizingPictures');
    setPercentGeneratingPdf(0);
    sharePdf();
  }

  async function sharePdf(): Promise<void> {
    setTimeout(async () => {
      try {
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
      } catch (e) {
        Alert.alert(e as string);
        setLoadingShare(false);
      }
      setLoadingShare(false);
    }, 1000);
  }

  async function handleShareProofPhotosPDF() {
    setLoadingShare(true);
    setMessageGeneratingPdf('optimizingPictures');
    setPercentGeneratingPdf(0);
    const pdf = await generateProofPhotosPDF();
    Share.open({
      url: pdf,
      title: `Proof Photos Report: ${area?.name}`,
      type: 'application/pdf',
    });
    setLoadingShare(false);
  }

  async function generateProofPhotosPDF(): Promise<string> {
    const newListPhotos: ProofPhotosDBProps[] = [];

    const response = await fetchProofPhotosArea(area.id);
    const totalProofPhotos = response.length + 1;

    let totalConverted = 0;

    for (let b = 0; b < response.length; b++) {
      const register = response[b];
      const photo = register.photo;
      const base64 = await convertImageToBase64({
        uri: photo,
        width: 500,
        height: 500,
      });
      newListPhotos.push({
        ...register,
        photo: base64,
      });
      totalConverted += 1;
      setPercentGeneratingPdf(
        Math.ceil((totalConverted / totalProofPhotos) * 100),
      );
    }
    const proofPhoto = await convertImageToBase64({
      uri: area.proofPhoto,
      width: 500,
      height: 500,
    });
    totalConverted += 1;
    setPercentGeneratingPdf(
      Math.ceil((totalConverted / totalProofPhotos) * 100),
    );
    setMessageGeneratingPdf('creatingPDF');

    const pdfUri = await generateReportProofPhotos({
      areaName: area?.name,
      coordinates: coordinatesArea,
      areaSize: `${Intl.NumberFormat('pt-BR').format(areaSize)} m²`,
      proofPhotos: newListPhotos,
      proofPhoto,
      regenerator: {
        address: area.regeneratorAddress,
      },
      date: format(new Date(), 'dd/MM/yyyy'),
      version: '1',
    });

    return pdfUri;
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
      <View className="items-center mt-5">
        <Image
          source={SintropiaLogo}
          className="w-36 h-[80]"
          resizeMode="contain"
        />
      </View>
      <Text className="font-bold text-black text-lg mt-5">
        {t('reportScreen.justificationReport')}
      </Text>
      <Text className="text-gray-500">{area?.name}</Text>

      <View className="w-full flex-row items-center justify-between py-1 px-2 rounded-2xl border border-gray-500 mt-2">
        <Text className="text-gray-500">
          {t('reportScreen.inspectionReport')}
        </Text>
        <TouchableOpacity
          onPress={handleSharePDF}
          className="h-10 w-28 rounded-2xl bg-green-600 flex-row items-center justify-center"
          disabled={loadingShare}
          style={{ opacity: loadingShare ? 0.5 : 1 }}
        >
          <Text className="font-semibold text-white">
            {t('reportScreen.share')}
          </Text>
        </TouchableOpacity>
      </View>

      <View className="w-full flex-row items-center justify-between py-1 px-2 rounded-2xl border border-gray-500 mt-2">
        <Text className="text-gray-500">
          {t('reportScreen.proofPhotosReport')}
        </Text>
        <TouchableOpacity
          onPress={handleShareProofPhotosPDF}
          className="h-10 w-28 rounded-2xl bg-green-600 flex-row items-center justify-center"
          disabled={loadingShare}
          style={{ opacity: loadingShare ? 0.5 : 1 }}
        >
          <Text className="font-semibold text-white">
            {t('reportScreen.share')}
          </Text>
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

      <Text className="mt-3 text-gray-500">
        {t('areaSize')}: {Intl.NumberFormat('pt-BR').format(area.size)} m²
      </Text>

      {collectionMethod === 'sampling' && (
        <>
          <Text className="text-gray-500">
            {t('samplingRadius')}: {samplingSize} m
          </Text>
          <Text className="text-gray-500">
            {t('samplingArea')}: {calculateAreaCircle(samplingSize)} m²
          </Text>
          {treesPerSampling.map((item, index) => (
            <Text key={index} className="text-gray-500">
              {t('numberOfTreesInTheSampling')} {item.samplingNumber}:{' '}
              {item.treesCount}
            </Text>
          ))}
        </>
      )}

      <View className="flex-row items-center justify-center mt-5">
        <View className="w-[48%] h-20 rounded-2xl items-center justify-center bg-gray-200">
          <Text className="font-bold text-black text-4xl">{totalTrees}</Text>
          <Text className="text-gray-500">{t('trees')}</Text>
        </View>

        <View className="w-[48%] h-20 rounded-2xl items-center justify-center bg-gray-200 ml-3">
          <Text className="font-bold text-black text-4xl">
            {totalBiodiversity}
          </Text>
          <Text className="text-gray-500">{t('biodiversity')}</Text>
        </View>
      </View>

      {collectionMethod === 'sampling' && <Calculation />}

      <BiodiversityList list={biodiversity} />

      <SamplingList samplings={samplings} collectionMethod={collectionMethod} />

      <View className="mb-20" />

      {loadingShare && (
        <LoadingGeneratingPdf
          percentage={percentGeneratingPdf}
          message={messageGeneratingPdf}
        />
      )}
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
