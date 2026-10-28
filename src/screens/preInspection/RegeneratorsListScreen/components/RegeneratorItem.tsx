import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { RegeneratorProps } from '../../../../types/regenerator';

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
      className="w-full rounded-2xl bg-gray-200 p-3 mb-3"
      onPress={onPress}
      disabled={loading}
    >
      <View className="flex-row items-center justify-between">
        <Text
          className="font-semibold text-black flex-1 mr-2"
          numberOfLines={1}
        >
          {regenerator.name || shortAddress(regenerator.regeneratorWallet)}
        </Text>
        {loading ? (
          <ActivityIndicator color="#229B13" />
        ) : (
          <Text className="text-gray-500 text-xs">#{regenerator.id}</Text>
        )}
      </View>

      <Text className="text-gray-500 text-xs mt-1">
        {shortAddress(regenerator.regeneratorWallet)} ·{' '}
        {Intl.NumberFormat('pt-BR').format(regenerator.totalArea)} m² ·{' '}
        {t('regeneratorsList.inspections', {
          count: regenerator.totalInspections,
        })}
      </Text>

      {regenerator.pendingInspection && (
        <View className="self-start rounded-full bg-yellow-200 px-2 py-0.5 mt-2">
          <Text className="text-xs text-black">
            {t('regeneratorsList.pendingInspection')}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
