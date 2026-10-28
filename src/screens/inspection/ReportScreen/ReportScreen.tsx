import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Share from 'react-native-share';
import { Screen } from '../../../components/Screen/Screen';
import { useTranslation } from 'react-i18next';
import { Camera, MapView, StyleURL } from '@rnmapbox/maps';
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
import { generateReportPDF } from '../../../services/inspection/generateReportPDF';
import { convertImageToBase64 } from '../../../services/inspection/convertImageToBase64';
import {
  generateReportPDFSamplingMode,
  SamplingPDFProps,
} from '../../../services/inspection/generateReportPDFSamplingMode';
import { extrapolateTreesToArea } from '../../../services/inspection/extrapolateTreesToArea';
import { Calculation } from './components/Calculation/Calculation';
import { calculateAreaCircle } from '../../../services/inspection/calculateAreaCircle';
import { LoadingGeneratingPdf } from './components/LoadingGeneratingPdf/LoadingGeneratingPdf';
import { generateReportProofPhotos } from '../../../services/inspection/generateReportProofPhotos';

import { format } from 'date-fns';
import { APP_VERSION } from '../../../constants/app';
import { TreesAndBiodiversityMarkers } from '../../../components/Map/RegisterMarkers';
import { SamplingCircles } from '../../../components/Map/SamplingCircles';
import { useFitBounds } from '../../../hooks/useFitBounds';
import { boundsOf } from '../../../utils/geo';
import { AppButton } from '../../../components/ui/AppButton';
import { Card } from '../../../components/ui/Card';
import { Icon } from '../../../components/Icon/Icon';
import colors from '../../../theme/colors';

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
    fetchTreesByAreaId,
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
  const [areaTrees, setAreaTrees] = useState<TreeDBProps[]>([]);
  const areaBounds = useMemo(() => boundsOf(pathPolyline), [pathPolyline]);
  const { cameraRef, onMapLoaded, defaultSettings } = useFitBounds(areaBounds);
  const mapRef = useRef<MapView>(null);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [samplings, loadingSamplings]);

  async function setAreaData() {
    setLoadingAreaData(true);
    setAreaSize(area?.size);

    const coords = JSON.parse(area.coordinates) as CoordinateProps[];
    setCoordinatesArea(coords);
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
    if (loadingSamplings) return;
    if (samplings.length === 0) {
      setLoadingTrees(false);
      return;
    }

    setLoadingTrees(true);
    setAreaTrees(await fetchTreesByAreaId(area.id));

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

  async function captureMap(): Promise<string> {
    try {
      return (await mapRef.current?.takeSnap(false)) ?? '';
    } catch (e) {
      console.warn('Map snapshot failed', e);
      return '';
    }
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
    const mapImage = await captureMap();

    const pdfUri = await generateReportPDF({
      mapImage,
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
      version: APP_VERSION,
      inspectorReport: area?.inspectorReport,
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
    const mapImage = await captureMap();

    const pdfUri = await generateReportPDFSamplingMode({
      mapImage,
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
      version: APP_VERSION,
      inspectorReport: area?.inspectorReport,
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
    const mapImage = await captureMap();

    const pdfUri = await generateReportProofPhotos({
      mapImage,
      areaName: area?.name,
      coordinates: coordinatesArea,
      areaSize: `${Intl.NumberFormat('pt-BR').format(areaSize)} m²`,
      proofPhotos: newListPhotos,
      proofPhoto,
      regenerator: {
        address: area.regeneratorAddress,
      },
      date: format(new Date(), 'dd/MM/yyyy'),
      version: APP_VERSION,
    });

    return pdfUri;
  }

  if (loadingAreaData || loadingBio || loadingSamplings || loadingTrees) {
    return (
      <Screen screenTitle={t('report')} subtitle={area?.name} showBackButton>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.brand} />
        </View>
      </Screen>
    );
  }

  const isSampling = collectionMethod === 'sampling';

  return (
    <Screen
      screenTitle={t('report')}
      subtitle={area?.name}
      showBackButton
      scrollable
      footer={
        <View className="flex-row">
          <AppButton
            title={t('reportScreen.sharePhotos')}
            icon="image"
            variant="secondary"
            compact
            onPress={handleShareProofPhotosPDF}
            disabled={loadingShare}
            style={{ flex: 1, marginRight: 8 }}
          />
          <AppButton
            title={t('reportScreen.shareReport')}
            icon="share"
            compact
            onPress={handleSharePDF}
            disabled={loadingShare}
            style={{ flex: 1 }}
          />
        </View>
      }
    >
      <View className="rounded-3xl overflow-hidden mt-2 border border-line">
        <MapView
          ref={mapRef}
          style={styles.mapContainer}
          styleURL={StyleURL.SatelliteStreet}
          onDidFinishLoadingMap={onMapLoaded}
          scaleBarEnabled={false}
        >
          <Camera ref={cameraRef} defaultSettings={defaultSettings} />
          <Polyline
            id="area"
            lineColor="red"
            lineWidth={3}
            coordinates={pathPolyline}
          />
          {isSampling && <SamplingCircles samplings={samplings} />}
          <TreesAndBiodiversityMarkers
            trees={areaTrees}
            biodiversity={biodiversity}
          />
        </MapView>
      </View>
      <Text className="text-xs text-muted mt-2">
        {t('areaSize')}: {Intl.NumberFormat('pt-BR').format(area.size)} m²
      </Text>

      <View className="flex-row mt-5" style={{ gap: 12 }}>
        <ResultTile
          color={colors.tree}
          icon="tree"
          value={Intl.NumberFormat('pt-BR').format(totalTrees)}
          label={
            isSampling ? t('collection.summary.estimatedTrees') : t('trees')
          }
        />
        <ResultTile
          color={colors.bio}
          icon="leaf"
          value={String(totalBiodiversity)}
          label={t('collection.summary.species')}
        />
      </View>

      {isSampling && (
        <Card style={{ marginTop: 16 }}>
          <Text className="font-bold text-ink text-base">
            {t('reportScreen.calculation')}
          </Text>
          <Text className="text-sm text-muted mt-1">
            {t('samplingRadius')}: {samplingSize} m · {t('samplingArea')}:{' '}
            {calculateAreaCircle(samplingSize)} m²
          </Text>
          {treesPerSampling.map(item => (
            <View
              key={item.samplingNumber}
              className="flex-row justify-between py-2 border-t border-line mt-2"
            >
              <Text className="text-ink">
                {t('collection.samplingNumber', {
                  number: item.samplingNumber,
                })}
              </Text>
              <Text className="text-ink font-semibold">
                {t('collection.treesCount', { count: item.treesCount })}
              </Text>
            </View>
          ))}
          <Calculation />
        </Card>
      )}

      {area?.inspectorReport ? (
        <Card style={{ marginTop: 16 }}>
          <Text className="font-bold text-ink text-base">
            {t('inspectorReport.title')}
          </Text>
          <Text className="text-ink mt-2">{area.inspectorReport}</Text>
        </Card>
      ) : null}

      <PhotoGrid
        title={t('collection.species')}
        color={colors.bio}
        photos={biodiversity.map(item => item.photo)}
        emptyLabel={t('anyBiodiversityRegistered')}
      />
      <PhotoGrid
        title={t('collection.trees')}
        color={colors.tree}
        photos={areaTrees.map(item => item.photo)}
        emptyLabel={t('anyTreeRegistered')}
      />

      {loadingShare && (
        <LoadingGeneratingPdf
          percentage={percentGeneratingPdf}
          message={messageGeneratingPdf}
        />
      )}
    </Screen>
  );
}

function ResultTile({
  color,
  icon,
  value,
  label,
}: {
  color: string;
  icon: 'tree' | 'leaf';
  value: string;
  label: string;
}) {
  return (
    <View className="flex-1 bg-surface rounded-3xl border border-line p-4">
      <View
        className="w-9 h-9 rounded-full items-center justify-center"
        style={{ backgroundColor: color }}
      >
        <Icon name={icon} size={18} color="#FFFFFF" />
      </View>
      <Text className="text-3xl font-bold text-ink mt-3">{value}</Text>
      <Text className="text-xs text-muted">{label}</Text>
    </View>
  );
}

function PhotoGrid({
  title,
  color,
  photos,
  emptyLabel,
}: {
  title: string;
  color: string;
  photos: string[];
  emptyLabel: string;
}) {
  return (
    <View className="mt-7">
      <View className="flex-row items-center mb-3">
        <View
          className="w-3 h-3 rounded-full mr-2"
          style={{ backgroundColor: color }}
        />
        <Text className="font-bold text-ink text-base">{title}</Text>
        <Text className="text-muted ml-2">{photos.length}</Text>
      </View>
      {photos.length === 0 ? (
        <Text className="text-muted">{emptyLabel}</Text>
      ) : (
        <View className="flex-row flex-wrap" style={{ gap: 8 }}>
          {photos.map((photo, index) => (
            <Image
              key={index}
              source={{ uri: photo }}
              className="rounded-2xl bg-line"
              style={{ width: 76, height: 76 }}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    width: '100%',
    height: 280,
  },
});
