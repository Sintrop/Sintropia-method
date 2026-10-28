import React from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Modal, View, Text } from 'react-native';
import colors from '../../../../../theme/colors';

interface Props {
  percentage: number;
  message: string;
}

export function LoadingGeneratingPdf({ percentage, message }: Props) {
  const { t } = useTranslation();

  return (
    <Modal visible animationType="fade" transparent>
      <View className="flex-1 items-center justify-center bg-black/50">
        <View className="w-[260] bg-surface rounded-3xl p-6 items-center">
          <ActivityIndicator color={colors.brand} />
          <Text className="text-ink font-semibold mt-3">
            {t('generatingPDF')}
          </Text>
          <Text className="font-bold text-brand text-4xl mt-2">
            {percentage}%
          </Text>
          <Text className="text-muted text-sm mt-1">{t(message)}...</Text>
        </View>
      </View>
    </Modal>
  );
}
