import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Screen } from '../../../components/Screen/Screen';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PreInspectionStackParamsList } from '../../../routes/PreInspectionRoutes';
import Mapbox, {
  Camera,
  FillLayer,
  MapView,
  ShapeSource,
  StyleURL,
} from '@rnmapbox/maps';
import { Polyline } from '../../../components/Map/Polyline';
import { useInspectionContext } from '../../../hooks/useInspectionContext';
import { useFitBounds } from '../../../hooks/useFitBounds';
import { areaRing, boundsOf } from '../../../utils/geo';
import { shortAddress } from '../RegeneratorsListScreen/components/RegeneratorItem';
import { AppButton } from '../../../components/ui/AppButton';
import { Badge } from '../../../components/ui/Badge';
import { SectionTitle } from '../../../components/ui/SectionTitle';
import { Icon, IconName } from '../../../components/Icon/Icon';
import colors from '../../../theme/colors';
import Config from 'react-native-config';

Mapbox.setAccessToken(Config.MAPBOX_ACCESS_TOKEN ?? '');

/** Below this size counting every tree is feasible; above it, sample. */
const MANUAL_MAX_AREA = 5000;

type Method = 'manual' | 'sampling';

type ScreenProps = NativeStackScreenProps<
  PreInspectionStackParamsList,
  'AreaPreviewScreen'
>;
export function AreaPreviewScreen({ route }: ScreenProps) {
  const { startInspection } = useInspectionContext();
  const { coords, regenerator } = route.params;
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState<Method>(
    regenerator.totalArea <= MANUAL_MAX_AREA ? 'manual' : 'sampling',
  );

  const ring = useMemo(() => areaRing(coords), [coords]);
  const bounds = useMemo(() => boundsOf(ring), [ring]);
  const { cameraRef, onMapLoaded, defaultSettings } = useFitBounds(bounds, 30);

  async function handleStartInspection() {
    setLoading(true);
    await startInspection({
      regenerator: {
        address: regenerator.regeneratorWallet,
        name: regenerator.name,
      },
      coordinates: coords,
      areaSize: regenerator.totalArea,
      collectionMethod: method,
    });
    setLoading(false);
  }

  return (
    <Screen
      screenTitle={t('areaPreview')}
      showBackButton
      scrollable
      footer={
        <AppButton
          title={t('startInspection')}
          icon="map"
          loading={loading}
          onPress={handleStartInspection}
        />
      }
    >
      <Text className="text-2xl font-bold text-ink mt-2">
        {regenerator.name}
      </Text>
      <View className="flex-row items-center mt-1">
        <Text className="text-sm text-muted mr-2">
          #{regenerator.id} · {shortAddress(regenerator.regeneratorWallet)}
        </Text>
        {regenerator.pendingInspection && (
          <Badge
            label={t('regeneratorsList.pendingInspection')}
            tone="warning"
          />
        )}
      </View>

      <View className="rounded-3xl overflow-hidden mt-4 border border-line">
        <MapView
          style={styles.mapContainer}
          styleURL={StyleURL.SatelliteStreet}
          onDidFinishLoadingMap={onMapLoaded}
          scaleBarEnabled={false}
        >
          <Camera ref={cameraRef} defaultSettings={defaultSettings} />
          <ShapeSource
            id="area-fill-source"
            shape={{
              type: 'Feature',
              properties: {},
              geometry: { type: 'Polygon', coordinates: [ring] },
            }}
          >
            <FillLayer
              id="area-fill"
              style={{ fillColor: 'rgba(255, 0, 0, 0.15)' }}
            />
          </ShapeSource>
          <Polyline
            id="area"
            lineColor="red"
            lineWidth={3}
            coordinates={ring}
          />
        </MapView>
      </View>

      <View className="flex-row mt-3" style={{ gap: 8 }}>
        <Fact
          label={t('areaSize')}
          value={`${Intl.NumberFormat('pt-BR').format(
            regenerator.totalArea,
          )} m²`}
        />
        <Fact
          label={t('regeneratorsList.inspectionsLabel')}
          value={String(regenerator.totalInspections)}
        />
      </View>

      <SectionTitle
        title={t('collectionMethod')}
        subtitle={t('areaPreviewScreen.methodHint')}
        style={{ marginTop: 28, marginBottom: 12 }}
      />
      <MethodOption
        icon="target"
        title={t('sampling')}
        description={t('areaPreviewScreen.samplingDescription')}
        selected={method === 'sampling'}
        onPress={() => setMethod('sampling')}
      />
      <MethodOption
        icon="tree"
        title={t('manual')}
        description={t('areaPreviewScreen.manualDescription')}
        selected={method === 'manual'}
        onPress={() => setMethod('manual')}
      />
    </Screen>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 bg-surface border border-line rounded-2xl px-4 py-3">
      <Text className="text-xs text-muted">{label}</Text>
      <Text className="text-base font-bold text-ink mt-0.5">{value}</Text>
    </View>
  );
}

function MethodOption({
  icon,
  title,
  description,
  selected,
  onPress,
}: {
  icon: IconName;
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className={`flex-row items-center rounded-3xl p-4 mb-3 border-2 ${
        selected ? 'border-brand bg-brand-soft' : 'border-line bg-surface'
      }`}
    >
      <View
        className={`w-11 h-11 rounded-2xl items-center justify-center ${
          selected ? 'bg-brand' : 'bg-canvas'
        }`}
      >
        <Icon
          name={icon}
          size={22}
          color={selected ? '#FFFFFF' : colors.muted}
        />
      </View>
      <View className="flex-1 ml-3">
        <Text className="font-bold text-ink text-base">{title}</Text>
        <Text className="text-sm text-muted mt-0.5">{description}</Text>
      </View>
      <View
        className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
          selected ? 'border-brand bg-brand' : 'border-line'
        }`}
      >
        {selected && <Icon name="check" size={14} color="#FFFFFF" />}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    height: 260,
    width: '100%',
  },
});
