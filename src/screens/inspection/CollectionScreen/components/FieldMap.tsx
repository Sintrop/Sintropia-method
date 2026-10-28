import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import {
  Camera,
  FillLayer,
  LineLayer,
  MapView,
  ShapeSource,
  StyleURL,
  UserLocation,
  UserTrackingMode,
} from '@rnmapbox/maps';
import { circle, distance, point } from '@turf/turf';
import { Polyline } from '../../../../components/Map/Polyline';
import { SamplingCircles } from '../../../../components/Map/SamplingCircles';
import { TreesAndBiodiversityMarkers } from '../../../../components/Map/RegisterMarkers';
import { Icon, IconName } from '../../../../components/Icon/Icon';
import { AppButton } from '../../../../components/ui/AppButton';
import { BiodiversityDBProps, TreeDBProps } from '../../../../types/database';
import {
  boundsOf,
  LngLat,
  parseStoredCoordinate,
  SamplingShape,
} from '../../../../utils/geo';
import { FieldPosition } from '../../../../utils/fieldPosition';
import { getRandomPointInPolygon } from '../../../../services/inspection/getRandomPointInPolygon';
import colors from '../../../../theme/colors';
import { ItemDetailSheet, SelectedItem } from './ItemDetailSheet';
import { RegisterRequest } from './RegisterFlow';

const SAMPLING_RADII = [5, 10, 15, 20];
/** Touch tolerance around a point on the map, in screen points. */
const TOUCH_RADIUS = 24;

interface Props {
  areaName: string;
  method: 'manual' | 'sampling';
  ring: LngLat[];
  samplings: SamplingShape[];
  trees: TreeDBProps[];
  biodiversity: BiodiversityDBProps[];
  treesBySampling: Record<number, number>;
  position: LngLat | null;
  fieldPosition: FieldPosition;
  topInset: number;
  onExit: () => void;
  onHelp: () => void;
  onRegister: (request: RegisterRequest) => void;
  onCreateSampling: (center: LngLat, radius: number) => Promise<void>;
  onDelete: (selected: SelectedItem) => Promise<void>;
}

export function FieldMap({
  areaName,
  method,
  ring,
  samplings,
  trees,
  biodiversity,
  treesBySampling,
  position,
  fieldPosition,
  topInset,
  onExit,
  onHelp,
  onRegister,
  onCreateSampling,
  onDelete,
}: Props) {
  const { t } = useTranslation();
  const mapRef = useRef<MapView>(null);
  const cameraRef = useRef<Camera>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [followUser, setFollowUser] = useState(true);
  const [selected, setSelected] = useState<SelectedItem | null>(null);
  const [draft, setDraft] = useState<{ center: LngLat; radius: number }>();
  const [creatingSampling, setCreatingSampling] = useState(false);

  const isSampling = method === 'sampling';
  const areaBounds = useMemo(() => boundsOf(ring), [ring]);
  const currentSampling =
    fieldPosition.kind === 'inSampling' ? fieldPosition.sampling : undefined;
  const samplingRows = useMemo(
    () =>
      samplings.map(sampling => ({
        id: sampling.id,
        size: sampling.radius,
        number: sampling.number,
        coordinate: JSON.stringify({
          latitude: sampling.center[1],
          longitude: sampling.center[0],
        }),
        areaId: 0,
      })),
    [samplings],
  );

  // Start on the whole area and follow the inspector once the first GPS fix
  // arrives.
  const hasPosition = !!position;
  useEffect(() => {
    setFollowUser(hasPosition);
  }, [hasPosition]);

  // Camera moves only take effect once following the user is off, so they
  // are queued and applied after that state change has rendered.
  const [cameraRequest, setCameraRequest] = useState<{
    bounds: { ne: LngLat; sw: LngLat };
    bottomPadding: number;
    duration: number;
  }>();

  useEffect(() => {
    if (!cameraRequest || followUser) return;
    cameraRef.current?.fitBounds(
      cameraRequest.bounds.ne,
      cameraRequest.bounds.sw,
      [topInset + 140, 40, cameraRequest.bottomPadding, 40],
      cameraRequest.duration,
    );
    setCameraRequest(undefined);
  }, [cameraRequest, followUser, topInset]);

  function moveCamera(
    bounds: { ne: LngLat; sw: LngLat } | null,
    bottomPadding = 230,
    duration = 600,
  ) {
    if (!bounds) return;
    setFollowUser(false);
    setCameraRequest({ bounds, bottomPadding, duration });
  }

  function fitArea(duration = 600) {
    moveCamera(areaBounds, 230, duration);
  }

  function circleBounds(center: LngLat, radius: number) {
    return boundsOf(
      circle(center, radius * 1.6, { steps: 16, units: 'meters' }).geometry
        .coordinates[0] as LngLat[],
    );
  }

  function flyTo(sampling: SamplingShape) {
    moveCamera(circleBounds(sampling.center, sampling.radius));
  }

  async function handleMapPress(feature: GeoJSON.Feature) {
    if (draft) return;
    const tap = (feature.geometry as GeoJSON.Point).coordinates as LngLat;
    const zoom = (await mapRef.current?.getZoom()) ?? 18;
    const metersPerPoint =
      (156543.03392 * Math.cos((tap[1] * Math.PI) / 180)) / Math.pow(2, zoom);
    const maxMeters = TOUCH_RADIUS * metersPerPoint;

    let best: { item: SelectedItem; meters: number } | null = null;
    const consider = (target: LngLat | null, item: SelectedItem) => {
      if (!target) return;
      const meters = distance(point(tap), point(target), { units: 'meters' });
      if (meters <= maxMeters && (!best || meters < best.meters)) {
        best = { item, meters };
      }
    };

    for (const tree of trees) {
      consider(parseStoredCoordinate(tree.coordinate), {
        kind: 'tree',
        item: tree,
        samplingNumber: samplings.find(s => s.id === tree.samplingId)?.number,
      });
    }
    for (const bio of biodiversity) {
      consider(parseStoredCoordinate(bio.coordinate), {
        kind: 'biodiversity',
        item: bio,
      });
    }
    if (isSampling) {
      for (const sampling of samplings) {
        consider(sampling.center, {
          kind: 'sampling',
          sampling,
          trees: treesBySampling[sampling.id] ?? 0,
        });
      }
    }

    const found = best as { item: SelectedItem } | null;
    if (found) {
      setSelected(found.item);
      setDetailOpen(true);
    }
  }

  function startDraft() {
    try {
      const random = getRandomPointInPolygon(ring);
      const radius = samplings[0]?.radius ?? draft?.radius ?? 10;
      const center: LngLat = [random.longitude, random.latitude];
      setDraft({ center, radius });
      // Keep the drawn circle above the confirmation panel.
      moveCamera(circleBounds(center, Math.max(radius, 10) * 2), 380);
    } catch {
      Alert.alert(t('atention'), t('collection.samplingPointError'));
    }
  }

  async function confirmDraft() {
    if (!draft) return;
    setCreatingSampling(true);
    await onCreateSampling(draft.center, draft.radius);
    setCreatingSampling(false);
    setDraft(undefined);
  }

  function requestRegister(type: RegisterRequest['type']) {
    if (!position) return;
    onRegister({
      type,
      position,
      sampling: type === 'tree' ? currentSampling : undefined,
    });
  }

  const insideArea =
    fieldPosition.kind === 'inArea' || fieldPosition.kind === 'inSampling';
  const canRegisterTree = isSampling ? !!currentSampling : insideArea;
  const canRegisterBio = insideArea;

  const status = statusFor(fieldPosition, isSampling, t);
  const draftShape = useMemo(
    () =>
      draft
        ? circle(draft.center, draft.radius, { steps: 64, units: 'meters' })
        : null,
    [draft],
  );

  return (
    <View style={StyleSheet.absoluteFill}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        styleURL={StyleURL.SatelliteStreet}
        scaleBarEnabled={false}
        onPress={handleMapPress}
        onTouchStart={() => followUser && setFollowUser(false)}
        onDidFinishLoadingMap={() => !position && fitArea(0)}
      >
        <Camera
          ref={cameraRef}
          followUserLocation={followUser}
          followUserMode={UserTrackingMode.Follow}
          followZoomLevel={19}
          defaultSettings={
            areaBounds
              ? {
                  bounds: {
                    ne: areaBounds.ne,
                    sw: areaBounds.sw,
                    paddingTop: topInset + 140,
                    paddingBottom: 230,
                    paddingLeft: 40,
                    paddingRight: 40,
                  },
                }
              : undefined
          }
        />
        <UserLocation showsUserHeadingIndicator minDisplacement={1} />

        <Polyline
          id="area"
          lineColor="#ef4444"
          lineWidth={3}
          coordinates={ring}
        />

        {isSampling && (
          <SamplingCircles
            samplings={samplingRows}
            highlightedId={currentSampling?.id}
          />
        )}

        {draftShape && (
          <ShapeSource id="draft-sampling-source" shape={draftShape}>
            <FillLayer
              id="draft-sampling-fill"
              style={{ fillColor: 'rgba(249, 115, 22, 0.3)' }}
            />
            <LineLayer
              id="draft-sampling-line"
              style={{
                lineColor: '#f97316',
                lineWidth: 2,
                lineDasharray: [2, 1],
              }}
            />
          </ShapeSource>
        )}

        <TreesAndBiodiversityMarkers
          trees={trees}
          biodiversity={biodiversity}
        />
      </MapView>

      {/* Top: exit, area and GPS status, help */}
      <View
        className="absolute left-0 right-0 px-4"
        style={{ top: topInset + 8 }}
        pointerEvents="box-none"
      >
        <View className="flex-row items-center" pointerEvents="box-none">
          <RoundButton icon="exit" onPress={onExit} />
          <View className="flex-1 mx-2 bg-surface rounded-2xl px-4 py-2.5 shadow-sm">
            <Text className="font-bold text-ink" numberOfLines={1}>
              {areaName}
            </Text>
            <View className="flex-row items-center mt-0.5">
              <View
                className="w-2 h-2 rounded-full mr-1.5"
                style={{ backgroundColor: status.color }}
              />
              <Text
                className="text-xs font-semibold"
                style={{ color: status.color }}
                numberOfLines={1}
              >
                {status.label}
              </Text>
            </View>
          </View>
          <RoundButton icon="help" onPress={onHelp} />
        </View>

        <View className="flex-row mt-2" pointerEvents="box-none">
          <CountPill
            color={colors.tree}
            icon="tree"
            value={trees.length}
            label={t('collection.trees')}
          />
          <CountPill
            color={colors.bio}
            icon="leaf"
            value={biodiversity.length}
            label={t('collection.species')}
          />
          {isSampling && (
            <CountPill
              color={colors.sampling}
              icon="target"
              value={samplings.length}
              label={t('collection.samplings')}
            />
          )}
        </View>

        <View className="items-end mt-2" pointerEvents="box-none">
          <RoundButton
            icon="locate"
            active={followUser}
            onPress={() => setFollowUser(true)}
          />
          <View className="h-2" />
          <RoundButton icon="expand" onPress={() => fitArea()} />
        </View>
      </View>

      {/* Bottom: samplings and the register actions */}
      <View className="absolute left-0 right-0 bottom-0 pb-3">
        {draft ? (
          <View className="mx-4 bg-surface rounded-3xl p-4">
            <Text className="font-bold text-ink text-base">
              {t('collection.newSampling', { number: samplings.length + 1 })}
            </Text>
            <Text className="text-sm text-muted mt-1">
              {t('collection.newSamplingHint')}
            </Text>

            {samplings.length === 0 && (
              <View className="flex-row mt-3">
                {SAMPLING_RADII.map(radius => (
                  <TouchableOpacity
                    key={radius}
                    onPress={() => setDraft({ ...draft, radius })}
                    className={`mr-2 px-3.5 h-9 rounded-full items-center justify-center ${
                      draft.radius === radius ? 'bg-brand' : 'bg-canvas'
                    }`}
                  >
                    <Text
                      className={`font-semibold ${
                        draft.radius === radius ? 'text-white' : 'text-ink'
                      }`}
                    >
                      {radius} m
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View className="flex-row mt-4">
              <AppButton
                title={t('collection.drawAgain')}
                icon="shuffle"
                variant="secondary"
                compact
                onPress={startDraft}
                style={{ flex: 1, marginRight: 8 }}
              />
              <AppButton
                title={t('confirm')}
                icon="check"
                compact
                loading={creatingSampling}
                onPress={confirmDraft}
                style={{ flex: 1 }}
              />
            </View>
            <TouchableOpacity
              className="items-center mt-3"
              onPress={() => setDraft(undefined)}
            >
              <Text className="text-muted font-semibold">{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {isSampling && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16 }}
                className="mb-2"
              >
                <TouchableOpacity
                  onPress={startDraft}
                  className="flex-row items-center h-10 px-4 mr-2 rounded-full bg-sampling"
                >
                  <Icon name="plus" size={16} color="#FFFFFF" />
                  <Text className="text-white font-semibold ml-1">
                    {t('collection.sampling')}
                  </Text>
                </TouchableOpacity>
                {samplings.map(sampling => {
                  const isCurrent = currentSampling?.id === sampling.id;
                  return (
                    <TouchableOpacity
                      key={sampling.id}
                      onPress={() => flyTo(sampling)}
                      className={`flex-row items-center h-10 px-4 mr-2 rounded-full ${
                        isCurrent ? 'bg-sampling' : 'bg-surface'
                      }`}
                    >
                      <Text
                        className={`font-bold ${
                          isCurrent ? 'text-white' : 'text-ink'
                        }`}
                      >
                        #{sampling.number}
                      </Text>
                      <Text
                        className={`ml-1.5 text-xs ${
                          isCurrent ? 'text-white' : 'text-muted'
                        }`}
                      >
                        {t('collection.treesCount', {
                          count: treesBySampling[sampling.id] ?? 0,
                        })}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            <View className="flex-row px-4">
              <ActionButton
                icon="tree"
                label={t('collection.addTree')}
                hint={
                  !canRegisterTree
                    ? isSampling
                      ? t('collection.goInsideSampling')
                      : t('collection.goInsideArea')
                    : currentSampling
                    ? t('collection.samplingNumber', {
                        number: currentSampling.number,
                      })
                    : undefined
                }
                background={colors.tree}
                disabled={!canRegisterTree}
                onPress={() => requestRegister('tree')}
              />
              <View className="w-3" />
              <ActionButton
                icon="leaf"
                label={t('collection.addSpecies')}
                hint={
                  !canRegisterBio ? t('collection.goInsideArea') : undefined
                }
                background={colors.bio}
                disabled={!canRegisterBio}
                onPress={() => requestRegister('biodiversity')}
              />
            </View>
          </>
        )}
      </View>

      <ItemDetailSheet
        visible={detailOpen}
        onClose={() => setDetailOpen(false)}
        selected={selected}
        onDelete={async item => {
          await onDelete(item);
          setDetailOpen(false);
        }}
        onGoToSampling={sampling => {
          setDetailOpen(false);
          flyTo(sampling);
        }}
      />
    </View>
  );
}

function statusFor(
  fieldPosition: FieldPosition,
  isSampling: boolean,
  t: TFunction,
) {
  switch (fieldPosition.kind) {
    case 'waiting':
      return { label: t('collection.status.waiting'), color: colors.muted };
    case 'outside':
      return { label: t('collection.status.outside'), color: colors.danger };
    case 'inSampling':
      return {
        label: t('collection.status.inSampling', {
          number: fieldPosition.sampling.number,
        }),
        color: colors.sampling,
      };
    case 'inArea':
      return {
        label: isSampling
          ? t('collection.status.inAreaSampling')
          : t('collection.status.inArea'),
        color: colors.brand,
      };
  }
}

function RoundButton({
  icon,
  onPress,
  active,
}: {
  icon: IconName;
  onPress: () => void;
  active?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`w-11 h-11 rounded-full items-center justify-center ${
        active ? 'bg-brand' : 'bg-surface'
      }`}
    >
      <Icon name={icon} size={20} color={active ? '#FFFFFF' : colors.ink} />
    </TouchableOpacity>
  );
}

function CountPill({
  color,
  icon,
  value,
  label,
}: {
  color: string;
  icon: IconName;
  value: number;
  label: string;
}) {
  return (
    <View className="flex-row items-center bg-surface rounded-full pl-1 pr-3 h-8 mr-2">
      <View
        className="w-6 h-6 rounded-full items-center justify-center"
        style={{ backgroundColor: color }}
      >
        <Icon name={icon} size={14} color="#FFFFFF" />
      </View>
      <Text className="ml-1.5 font-bold text-ink">{value}</Text>
      <Text className="ml-1 text-xs text-muted">{label}</Text>
    </View>
  );
}

function ActionButton({
  icon,
  label,
  hint,
  background,
  disabled,
  onPress,
}: {
  icon: IconName;
  label: string;
  hint?: string;
  background: string;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      className="flex-1 h-16 rounded-2xl flex-row items-center px-4"
      style={{
        backgroundColor: disabled ? '#E5E7EB' : background,
      }}
    >
      <View className="w-9 h-9 rounded-full bg-white/30 items-center justify-center">
        <Icon
          name="plus"
          size={20}
          color={disabled ? colors.muted : '#FFFFFF'}
        />
      </View>
      <View className="ml-2.5 flex-1">
        <View className="flex-row items-center">
          <Icon
            name={icon}
            size={16}
            color={disabled ? colors.muted : '#FFFFFF'}
          />
          <Text
            className="ml-1 font-bold text-base"
            style={{ color: disabled ? colors.muted : '#FFFFFF' }}
          >
            {label}
          </Text>
        </View>
        {hint && (
          <Text
            className="text-xs"
            numberOfLines={2}
            style={{ color: disabled ? colors.muted : 'rgba(255,255,255,0.9)' }}
          >
            {hint}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
