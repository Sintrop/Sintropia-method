import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { InspectionStackParamsList } from '../../../routes/InspectionRoutes';
import { useInspectionContext } from '../../../hooks/useInspectionContext';
import { useCollectionData } from '../../../hooks/useCollectionData';
import { useLocation } from '../../../hooks/useLocation';
import { usePermissions } from '../../../hooks/usePermissions';
import { useSafeAreaApp } from '../../../hooks/useSafeAreaApp';
import { CoordinateProps } from '../../../types/regenerator';
import { areaRing, LngLat } from '../../../utils/geo';
import {
  countTreesBySampling,
  getFieldPosition,
} from '../../../utils/fieldPosition';
import { samplingShapes } from '../../../components/Map/SamplingCircles';
import { extrapolateTreesToArea } from '../../../services/inspection/extrapolateTreesToArea';
import { FieldMap } from './components/FieldMap';
import { PhotosPane, MIN_AREA_PHOTOS } from './components/PhotosPane';
import { Requirement, SummaryPane } from './components/SummaryPane';
import { CollectionMap } from '../../../components/Map/CollectionMap';
import { LoadingGeneratingPdf } from '../ReportScreen/components/LoadingGeneratingPdf/LoadingGeneratingPdf';
import { useReportExport } from '../../../hooks/useReportExport';
import { MapView } from '@rnmapbox/maps';
import { CollectionTab, TabBar } from './components/TabBar';
import {
  RegisterFlow,
  RegisterRequest,
  RegisterResult,
} from './components/RegisterFlow';
import { SelectedItem } from './components/ItemDetailSheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TUTORIAL_SEEN_KEY } from '../TutorialScreen/TutorialScreen';

const UNDEFINED_SPECIES = JSON.stringify({ id: 0, name: 'indefinido' });

type ScreenProps = NativeStackScreenProps<
  InspectionStackParamsList,
  'CollectionScreen'
>;

/**
 * The whole field collection in one place: the map with every sampling,
 * tree and species, the proof photos and the summary, switched by tabs
 * instead of separate screens.
 */
export function CollectionScreen({ navigation }: ScreenProps) {
  const { t } = useTranslation();
  const { top, bottom } = useSafeAreaApp();
  const {
    areaOpened: area,
    fetchOpenedAreas,
    exitInspectionMode,
    finishInspection,
    deleteAreaInspection,
  } = useInspectionContext();
  const data = useCollectionData(area?.id);
  const { location } = useLocation();
  const { requestLocationPermission } = usePermissions();
  const [tab, setTab] = useState<CollectionTab>('map');
  const [registerRequest, setRegisterRequest] =
    useState<RegisterRequest | null>(null);

  const method = area?.collectionMethod === 'manual' ? 'manual' : 'sampling';
  const summaryMapRef = useRef<MapView>(null);
  const exporter = useReportExport(area, method, summaryMapRef);

  useEffect(() => {
    requestLocationPermission();
  }, [requestLocationPermission]);

  // The tutorial opens by itself only on the first collection; afterwards
  // it stays one tap away on the help button.
  useEffect(() => {
    AsyncStorage.getItem(TUTORIAL_SEEN_KEY)
      .then(seen => !seen && navigation.navigate('TutorialScreen'))
      .catch(() => {});
  }, [navigation]);

  // Collections started before 1.1 may have no method saved.
  useEffect(() => {
    if (area && !area.collectionMethod && data.db) {
      data.updateCollectionMethod('sampling', area.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [area?.id, area?.collectionMethod, data.db]);

  useFocusEffect(
    useCallback(() => {
      data.reload();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.reload]),
  );

  // Manual collections count trees over the whole area as a single sampling.
  useEffect(() => {
    if (!area || method !== 'manual' || !data.loaded) return;
    if (data.samplings.length === 0) {
      data
        .addSampling({
          areaId: area.id,
          number: 1,
          size: area.size,
          coordinate: '',
        })
        .then(data.reload);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [area?.id, method, data.loaded, data.samplings.length]);

  const coordinates = useMemo(
    () => (area ? (JSON.parse(area.coordinates) as CoordinateProps[]) : []),
    [area?.coordinates],
  );
  const ring = useMemo(() => areaRing(coordinates), [coordinates]);
  const shapes = useMemo(
    () => (method === 'sampling' ? samplingShapes(data.samplings) : []),
    [data.samplings, method],
  );
  const position: LngLat | null = location
    ? [location.coords.longitude, location.coords.latitude]
    : null;
  const fieldPosition = getFieldPosition(position, ring, shapes);
  const treesBySampling = useMemo(
    () => countTreesBySampling(data.trees),
    [data.trees],
  );

  const treesResult = useMemo(() => {
    if (!area) return 0;
    if (method === 'manual') return data.trees.length;
    if (data.samplings.length === 0) return 0;
    return extrapolateTreesToArea({
      samplingSize: data.samplings[0].size,
      samplingTrees: data.samplings.map(s => treesBySampling[s.id] ?? 0),
      totalArea: area.size,
    });
  }, [area, method, data.samplings, data.trees.length, treesBySampling]);

  const requirements: Requirement[] = [
    method === 'sampling'
      ? {
          label: t('collection.requirements.sampling'),
          done: data.samplings.length > 0,
          tab: 'map',
        }
      : {
          label: t('collection.requirements.tree'),
          done: data.trees.length > 0,
          tab: 'map',
        },
    {
      label: t('collection.requirements.species'),
      done: data.biodiversity.length > 0,
      tab: 'map',
    },
    {
      label: t('collection.requirements.regeneratorPhoto'),
      done: !!area?.proofPhoto,
      tab: 'photos',
    },
    {
      label: t('collection.requirements.areaPhotos', { min: MIN_AREA_PHOTOS }),
      done: data.areaPhotos.length >= MIN_AREA_PHOTOS,
      tab: 'photos',
    },
  ];
  const photosPending = requirements.some(
    item => item.tab === 'photos' && !item.done,
  );

  async function handleSaveRegister(result: RegisterResult) {
    if (!area) return;
    const coordinate = JSON.stringify({
      latitude: String(result.position[1]),
      longitude: String(result.position[0]),
    });
    const bio = {
      areaId: area.id,
      coordinate,
      photo: result.photo,
      specieData: UNDEFINED_SPECIES,
    };

    if (result.type === 'tree') {
      const sampling =
        method === 'manual'
          ? { id: data.samplings[0]?.id, number: 1 }
          : result.sampling;
      if (!sampling?.id) return;
      await data.addTree({
        ...bio,
        samplingId: sampling.id,
        samplingNumber: sampling.number,
      });
      if (result.alsoNewSpecies) await data.addBiodiversity(bio);
    } else {
      await data.addBiodiversity(bio);
    }
    await data.reload();
  }

  async function handleCreateSampling(center: LngLat, radius: number) {
    if (!area) return;
    await data.addSampling({
      areaId: area.id,
      number: data.samplings.length + 1,
      size: radius,
      coordinate: JSON.stringify({ latitude: center[1], longitude: center[0] }),
    });
    await data.reload();
  }

  async function handleDelete(selected: SelectedItem) {
    if (selected.kind === 'tree') await data.deleteTree(selected.item.id);
    if (selected.kind === 'biodiversity') {
      await data.deleteBiodiversity(selected.item.id);
    }
    if (selected.kind === 'sampling') {
      await data.deleteSampling(selected.sampling.id);
    }
    await data.reload();
  }

  if (!area) {
    return (
      <View className="flex-1 items-center justify-center bg-canvas">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-canvas">
      <View className="flex-1">
        <FieldMap
          areaName={area.name}
          method={method}
          ring={ring}
          samplings={shapes}
          trees={data.trees}
          biodiversity={data.biodiversity}
          treesBySampling={treesBySampling}
          position={position}
          fieldPosition={fieldPosition}
          topInset={top}
          onExit={exitInspectionMode}
          onHelp={() => navigation.navigate('TutorialScreen')}
          onRegister={setRegisterRequest}
          onCreateSampling={handleCreateSampling}
          onDelete={handleDelete}
        />

        {tab === 'photos' && (
          <View style={StyleSheet.absoluteFill}>
            <PhotosPane
              regeneratorPhoto={area.proofPhoto}
              areaPhotos={data.areaPhotos}
              topInset={top}
              onSetRegeneratorPhoto={async uri => {
                await data.updateProofPhoto(uri, area.id);
                fetchOpenedAreas();
              }}
              onAddAreaPhoto={async uri => {
                await data.addProofPhoto({ areaId: area.id, photo: uri });
                await data.reload();
              }}
              onDeleteAreaPhoto={async id => {
                await data.deleteProofPhoto(id);
                await data.reload();
              }}
            />
          </View>
        )}

        {tab === 'summary' && (
          <View style={StyleSheet.absoluteFill}>
            <SummaryPane
              area={area}
              method={method}
              treesResult={treesResult}
              speciesCount={data.biodiversity.length}
              samplingsCount={data.samplings.length}
              samplingRadius={data.samplings[0]?.size}
              sampledTrees={data.trees.length}
              requirements={requirements}
              topInset={top}
              onSaveNotes={async notes => {
                await data.updateInspectorReport(notes, area.id);
                fetchOpenedAreas();
              }}
              onShareReport={exporter.shareInspectionReport}
              onSharePhotos={exporter.shareProofPhotos}
              exporting={!!exporter.progress}
              onGoToTab={setTab}
              map={
                <CollectionMap
                  ref={summaryMapRef}
                  coordinates={coordinates}
                  samplings={data.samplings}
                  trees={data.trees}
                  biodiversity={data.biodiversity}
                  showSamplings={method === 'sampling'}
                  height={200}
                />
              }
              onOpenReport={() =>
                navigation.navigate('ReportScreen', {
                  collectionMethod: method,
                  area,
                })
              }
              onFinish={async () => finishInspection(area.id)}
              onDelete={async () => deleteAreaInspection(area.id)}
            />
          </View>
        )}
      </View>

      <TabBar
        current={tab}
        onChange={setTab}
        bottomInset={bottom}
        pendingPhotos={photosPending}
      />

      {exporter.progress && (
        <LoadingGeneratingPdf
          percentage={exporter.progress.percent}
          message={exporter.progress.message}
        />
      )}

      <RegisterFlow
        request={registerRequest}
        onSave={handleSaveRegister}
        onClose={() => setRegisterRequest(null)}
      />
    </View>
  );
}
