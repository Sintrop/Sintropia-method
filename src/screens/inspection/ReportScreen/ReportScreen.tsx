import React, { useMemo, useRef } from 'react';
import { ActivityIndicator, Image, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MapView } from '@rnmapbox/maps';
import { Screen } from '../../../components/Screen/Screen';
import { InspectionStackParamsList } from '../../../routes/InspectionRoutes';
import { CoordinateProps } from '../../../types/regenerator';
import { useCollectionData } from '../../../hooks/useCollectionData';
import { useReportExport } from '../../../hooks/useReportExport';
import { extrapolateTreesToArea } from '../../../services/inspection/extrapolateTreesToArea';
import { calculateAreaCircle } from '../../../services/inspection/calculateAreaCircle';
import { countTreesBySampling } from '../../../utils/fieldPosition';
import { CollectionMap } from '../../../components/Map/CollectionMap';
import { AppButton } from '../../../components/ui/AppButton';
import { Card } from '../../../components/ui/Card';
import { Icon } from '../../../components/Icon/Icon';
import colors from '../../../theme/colors';
import { Calculation } from './components/Calculation/Calculation';
import { LoadingGeneratingPdf } from './components/LoadingGeneratingPdf/LoadingGeneratingPdf';

type ScreenProps = NativeStackScreenProps<
  InspectionStackParamsList,
  'ReportScreen'
>;
export function ReportScreen({ route }: ScreenProps) {
  const { collectionMethod, area } = route.params;
  const { t } = useTranslation();
  const mapRef = useRef<MapView>(null);
  const { samplings, trees, biodiversity, loaded } = useCollectionData(area.id);
  const { progress, shareInspectionReport, shareProofPhotos } = useReportExport(
    area,
    collectionMethod,
    mapRef,
  );

  const isSampling = collectionMethod === 'sampling';
  const coordinates = useMemo(
    () => JSON.parse(area.coordinates) as CoordinateProps[],
    [area.coordinates],
  );
  const treesBySampling = useMemo(() => countTreesBySampling(trees), [trees]);
  const samplingSize = samplings[0]?.size ?? 0;
  const totalTrees = useMemo(() => {
    if (!isSampling) return trees.length;
    if (samplings.length === 0) return 0;
    return extrapolateTreesToArea({
      samplingSize,
      samplingTrees: samplings.map(s => treesBySampling[s.id] ?? 0),
      totalArea: area.size,
    });
  }, [
    isSampling,
    trees.length,
    samplings,
    samplingSize,
    treesBySampling,
    area.size,
  ]);

  if (!loaded) {
    return (
      <Screen screenTitle={t('report')} subtitle={area.name} showBackButton>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.brand} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      screenTitle={t('report')}
      subtitle={area.name}
      showBackButton
      scrollable
      footer={
        <View className="flex-row">
          <AppButton
            title={t('reportScreen.sharePhotos')}
            icon="image"
            variant="secondary"
            compact
            onPress={shareProofPhotos}
            disabled={!!progress}
            style={{ flex: 1, marginRight: 8 }}
          />
          <AppButton
            title={t('reportScreen.shareReport')}
            icon="share"
            compact
            onPress={shareInspectionReport}
            disabled={!!progress}
            style={{ flex: 1 }}
          />
        </View>
      }
    >
      <View className="mt-2">
        <CollectionMap
          ref={mapRef}
          coordinates={coordinates}
          samplings={samplings}
          trees={trees}
          biodiversity={biodiversity}
          showSamplings={isSampling}
          height={280}
        />
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
          value={String(biodiversity.length)}
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
          {samplings.map((sampling, index) => (
            <View
              key={sampling.id}
              className="flex-row justify-between py-2 border-t border-line mt-2"
            >
              <Text className="text-ink">
                {t('collection.samplingNumber', { number: index + 1 })}
              </Text>
              <Text className="text-ink font-semibold">
                {t('collection.treesCount', {
                  count: treesBySampling[sampling.id] ?? 0,
                })}
              </Text>
            </View>
          ))}
          <Calculation />
        </Card>
      )}

      {area.inspectorReport ? (
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
        photos={trees.map(item => item.photo)}
        emptyLabel={t('anyTreeRegistered')}
      />

      {progress && (
        <LoadingGeneratingPdf
          percentage={progress.percent}
          message={progress.message}
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
