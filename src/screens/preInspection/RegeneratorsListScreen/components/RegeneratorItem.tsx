import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { RegeneratorProps } from '../../../../types/regenerator';
import { Badge } from '../../../../components/ui/Badge';
import { Icon } from '../../../../components/Icon/Icon';
import colors from '../../../../theme/colors';

interface Props {
  regenerator: RegeneratorProps;
  onPress: () => void;
  loading: boolean;
}

export function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function RegeneratorItem({ regenerator, onPress, loading }: Props) {
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      className="flex-row items-center bg-surface border border-line rounded-2xl px-4 py-3.5 mb-2"
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.8}
    >
      <View className="w-11 h-11 rounded-xl bg-brand-soft items-center justify-center">
        <Text className="font-bold text-brand-dark">#{regenerator.id}</Text>
      </View>
      <View className="flex-1 ml-3">
        <Text className="font-semibold text-ink text-base" numberOfLines={1}>
          {regenerator.name || shortAddress(regenerator.regeneratorWallet)}
        </Text>
        <Text className="text-xs text-muted mt-0.5">
          {Intl.NumberFormat('pt-BR').format(regenerator.totalArea)} m² ·{' '}
          {t('regeneratorsList.inspections', {
            count: regenerator.totalInspections,
          })}
        </Text>
        {regenerator.pendingInspection && (
          <View className="mt-1.5">
            <Badge
              label={t('regeneratorsList.pendingInspection')}
              tone="warning"
            />
          </View>
        )}
      </View>
      {loading ? (
        <ActivityIndicator color={colors.brand} />
      ) : (
        <Icon name="chevronRight" size={20} color={colors.muted} />
      )}
    </TouchableOpacity>
  );
}
