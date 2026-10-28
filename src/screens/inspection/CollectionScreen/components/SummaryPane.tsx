import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card } from '../../../../components/ui/Card';
import { AppButton } from '../../../../components/ui/AppButton';
import { Icon } from '../../../../components/Icon/Icon';
import { SectionTitle } from '../../../../components/ui/SectionTitle';
import { AreaDBProps } from '../../../../types/database';
import { calculateAreaCircle } from '../../../../services/inspection/calculateAreaCircle';
import colors from '../../../../theme/colors';

export interface Requirement {
  label: string;
  done: boolean;
  /** Tab where the inspector resolves this item. */
  tab: 'map' | 'photos';
}

interface Props {
  area: AreaDBProps;
  method: 'manual' | 'sampling';
  treesResult: number;
  speciesCount: number;
  samplingsCount: number;
  samplingRadius?: number;
  sampledTrees: number;
  requirements: Requirement[];
  topInset: number;
  onSaveNotes: (notes: string) => Promise<void>;
  onOpenReport: () => void;
  onShareReport: () => void;
  onSharePhotos: () => void;
  exporting: boolean;
  onGoToTab: (tab: Requirement['tab']) => void;
  map: React.ReactNode;
  onFinish: () => Promise<void>;
  onDelete: () => Promise<void>;
}

export function SummaryPane({
  area,
  method,
  treesResult,
  speciesCount,
  samplingsCount,
  samplingRadius,
  sampledTrees,
  requirements,
  topInset,
  onSaveNotes,
  onOpenReport,
  onShareReport,
  onSharePhotos,
  exporting,
  onGoToTab,
  map,
  onFinish,
  onDelete,
}: Props) {
  const { t } = useTranslation();
  const [notes, setNotes] = useState(area.inspectorReport ?? '');
  const [saved, setSaved] = useState(true);
  const firstRender = useRef(true);
  const canFinish = requirements.every(item => item.done);

  // Notes are saved a moment after the inspector stops typing.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setSaved(false);
    const timeout = setTimeout(async () => {
      await onSaveNotes(notes);
      setSaved(true);
    }, 800);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes]);

  function confirmFinish() {
    Alert.alert(t('atention'), t('textConfirmFinishInspection'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('finishInspection'), onPress: onFinish },
    ]);
  }

  function confirmDelete() {
    Alert.alert(t('atention'), t('textConfirmDeleteInspection'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('deleteInspection'), style: 'destructive', onPress: onDelete },
    ]);
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-canvas"
      style={{ paddingTop: topInset }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingTop: 16,
          paddingHorizontal: 20,
          paddingBottom: 24,
        }}
      >
        <Text className="text-2xl font-bold text-ink">{area.name}</Text>
        <Text className="text-sm text-muted mt-1">
          {Intl.NumberFormat('pt-BR').format(area.size)} m² ·{' '}
          {method === 'sampling' ? t('sampling') : t('manual')}
        </Text>

        <View className="mt-5">{map}</View>

        <View className="flex-row mt-3" style={{ gap: 12 }}>
          <ResultCard
            color={colors.tree}
            icon="tree"
            value={Intl.NumberFormat('pt-BR').format(treesResult)}
            label={
              method === 'sampling'
                ? t('collection.summary.estimatedTrees')
                : t('trees')
            }
          />
          <ResultCard
            color={colors.bio}
            icon="leaf"
            value={String(speciesCount)}
            label={t('collection.summary.species')}
          />
        </View>

        {method === 'sampling' && (
          <Text className="text-xs text-muted mt-3">
            {t('collection.summary.samplingBasis', {
              trees: sampledTrees,
              samplings: samplingsCount,
              area: samplingRadius ? calculateAreaCircle(samplingRadius) : 0,
            })}
          </Text>
        )}

        <SectionTitle
          title={t('collection.summary.checklist')}
          style={{ marginTop: 28, marginBottom: 8 }}
        />
        <Card>
          {requirements.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              disabled={item.done}
              onPress={() => onGoToTab(item.tab)}
              className={`flex-row items-center py-2.5 ${
                index > 0 ? 'border-t border-line' : ''
              }`}
            >
              <View
                className={`w-6 h-6 rounded-full items-center justify-center ${
                  item.done ? 'bg-brand' : 'bg-warning-soft'
                }`}
              >
                <Icon
                  name={item.done ? 'check' : 'alert'}
                  size={14}
                  color={item.done ? '#FFFFFF' : colors.warning}
                />
              </View>
              <Text className="ml-3 text-ink flex-1">{item.label}</Text>
              {!item.done && (
                <Icon name="chevronRight" size={18} color={colors.muted} />
              )}
            </TouchableOpacity>
          ))}
        </Card>

        <View className="flex-row items-end justify-between mt-7 mb-2">
          <SectionTitle title={t('inspectorReport.title')} />
          <Text className="text-xs text-muted">
            {saved
              ? t('collection.summary.saved')
              : t('collection.summary.saving')}
          </Text>
        </View>
        <Text className="text-sm text-muted mb-2">
          {t('inspectorReport.description')}
        </Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder={t('common.typeHere')}
          placeholderTextColor="#9CA3AF"
          multiline
          textAlignVertical="top"
          className="bg-surface border border-line rounded-2xl px-4 py-3 text-ink"
          style={{ minHeight: 120 }}
        />

        <SectionTitle
          title={t('collection.summary.reports')}
          style={{ marginTop: 28, marginBottom: 8 }}
        />
        <View className="flex-row">
          <AppButton
            title={t('reportScreen.sharePhotos')}
            icon="image"
            variant="secondary"
            compact
            onPress={onSharePhotos}
            disabled={exporting}
            style={{ flex: 1, marginRight: 8 }}
          />
          <AppButton
            title={t('reportScreen.shareReport')}
            icon="share"
            variant="secondary"
            compact
            onPress={onShareReport}
            disabled={exporting}
            style={{ flex: 1 }}
          />
        </View>
        <AppButton
          title={t('collection.summary.openReport')}
          icon="report"
          variant="ghost"
          compact
          onPress={onOpenReport}
          className="mt-1"
        />
        <AppButton
          title={t('markAsRealized')}
          icon="check"
          onPress={confirmFinish}
          disabled={!canFinish}
          className="mt-6"
        />
        {!canFinish && (
          <Text className="text-xs text-warning text-center mt-2">
            {t('collection.summary.completeChecklist')}
          </Text>
        )}
        <AppButton
          title={t('deleteInspection')}
          icon="trash"
          variant="danger"
          compact
          onPress={confirmDelete}
          className="mt-8"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function ResultCard({
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
