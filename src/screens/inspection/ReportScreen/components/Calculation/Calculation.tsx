import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text } from 'react-native';

export function Calculation() {
  const { t } = useTranslation();

  return (
    <View className="mt-3 rounded-2xl bg-canvas p-3">
      <Text className="font-semibold text-ink text-center">
        {t('result')} = {'{[(P1 + ... + Pn) / n] × Ai} / Ap'}
      </Text>
      <Text className="text-xs text-muted text-center mt-2">
        Ai = {t('inspectedArea')} · Ap = {t('samplingArea')} · n ={' '}
        {t('numberOfSamplings')} · P1…Pn = {t('trees')}
      </Text>
    </View>
  );
}
