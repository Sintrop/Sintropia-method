import React from 'react';
import { Alert, Image, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppButton } from '../../../../components/ui/AppButton';
import { Icon } from '../../../../components/Icon/Icon';
import { BottomSheet } from '../../../../components/ui/BottomSheet';
import { BiodiversityDBProps, TreeDBProps } from '../../../../types/database';
import { parseStoredCoordinate, SamplingShape } from '../../../../utils/geo';
import { calculateAreaCircle } from '../../../../services/inspection/calculateAreaCircle';
import colors from '../../../../theme/colors';

export type SelectedItem =
  | { kind: 'tree'; item: TreeDBProps; samplingNumber?: number }
  | { kind: 'biodiversity'; item: BiodiversityDBProps }
  | { kind: 'sampling'; sampling: SamplingShape; trees: number };

interface Props {
  visible: boolean;
  onClose: () => void;
  selected: SelectedItem | null;
  onDelete: (selected: SelectedItem) => Promise<void>;
  onGoToSampling: (sampling: SamplingShape) => void;
}

export function ItemDetailSheet({
  visible,
  onClose,
  selected,
  onDelete,
  onGoToSampling,
}: Props) {
  const { t } = useTranslation();

  function confirmDelete() {
    if (!selected) return;
    const message =
      selected.kind === 'tree'
        ? t('textConfirmDeleteTree')
        : selected.kind === 'biodiversity'
        ? t('textConfirmDeleteBio')
        : t('textConfirmDeleteSampling');
    Alert.alert(t('atention'), message, [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('collection.delete'),
        style: 'destructive',
        onPress: () => onDelete(selected),
      },
    ]);
  }

  function renderContent() {
    if (!selected) return null;

    if (selected.kind === 'sampling') {
      const { sampling } = selected;
      return (
        <>
          <Header
            color={colors.sampling}
            icon="target"
            title={t('collection.samplingNumber', { number: sampling.number })}
            subtitle={`${sampling.radius} m · ${calculateAreaCircle(
              sampling.radius,
            )} m²`}
          />
          <View className="flex-row mt-5">
            <Stat label={t('trees')} value={String(selected.trees)} />
          </View>
          <AppButton
            title={t('collection.goToSampling')}
            icon="locate"
            onPress={() => onGoToSampling(sampling)}
            className="mt-5"
          />
        </>
      );
    }

    const isTree = selected.kind === 'tree';
    const position = parseStoredCoordinate(selected.item.coordinate);
    return (
      <>
        <Header
          color={isTree ? colors.tree : colors.bio}
          icon={isTree ? 'tree' : 'leaf'}
          title={isTree ? t('collection.tree') : t('collection.species')}
          subtitle={
            isTree && selected.samplingNumber
              ? t('collection.register.inSampling', {
                  number: selected.samplingNumber,
                })
              : undefined
          }
        />
        <View className="flex-row mt-5">
          {selected.item.photo ? (
            <Image
              source={{ uri: selected.item.photo }}
              className="w-28 h-28 rounded-2xl bg-line"
            />
          ) : null}
          {position && (
            <View className="ml-4 justify-center">
              <Text className="text-xs text-muted">
                {t('collection.register.position')}
              </Text>
              <Text className="text-sm text-ink">
                {position[1].toFixed(6)}, {position[0].toFixed(6)}
              </Text>
            </View>
          )}
        </View>
      </>
    );
  }

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View>
        {renderContent()}
        {selected && (
          <AppButton
            title={t('collection.delete')}
            icon="trash"
            variant="danger"
            onPress={confirmDelete}
            className="mt-3"
          />
        )}
      </View>
    </BottomSheet>
  );
}

function Header({
  color,
  icon,
  title,
  subtitle,
}: {
  color: string;
  icon: 'tree' | 'leaf' | 'target';
  title: string;
  subtitle?: string;
}) {
  return (
    <View className="flex-row items-center">
      <View
        className="w-10 h-10 rounded-full items-center justify-center"
        style={{ backgroundColor: color }}
      >
        <Icon name={icon} color="#FFFFFF" size={20} />
      </View>
      <View className="ml-3">
        <Text className="text-lg font-bold text-ink">{title}</Text>
        {subtitle && <Text className="text-sm text-muted">{subtitle}</Text>}
      </View>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View className="bg-canvas rounded-2xl px-4 py-3 mr-3">
      <Text className="text-2xl font-bold text-ink">{value}</Text>
      <Text className="text-xs text-muted">{label}</Text>
    </View>
  );
}
