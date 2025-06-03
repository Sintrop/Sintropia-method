import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

interface Props {
  status: number;
}
export function StatusTagInspection({ status }: Props) {
  const { t } = useTranslation();

  if (status === 0) {
    return (
      <View className="px-5 h-7 w-fit rounded-2xl items-center justify-center bg-yellow-500">
        <Text className="text-white font-semibold">{t('open')}</Text>
      </View>
    );
  }

  if (status === 1) {
    return (
      <View className="px-5 h-7 w-fit rounded-2xl items-center justify-center bg-blue-500">
        <Text className="text-white font-semibold">{t('accepted')}</Text>
      </View>
    );
  }

  if (status === 2) {
    return (
      <View className="px-5 h-7 w-fit rounded-2xl items-center justify-center bg-green-500">
        <Text className="text-white font-semibold">{t('realized')}</Text>
      </View>
    );
  }

  if (status === 4) {
    return (
      <View className="px-5 h-7 w-fit rounded-2xl items-center justify-center bg-red-500">
        <Text className="text-white font-semibold">{t('invalidated')}</Text>
      </View>
    );
  }

  return <View />;
}
