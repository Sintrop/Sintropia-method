import React from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

interface Props {
  outside: boolean
}
export function OutsideTheCollectionArea({ outside }: Props) {
  const { t } = useTranslation();

  if (!outside) return <View />

  return (
    <View className="w-full h-9 rounded-2xl p-2 bg-yellow-500 mt-3">
      <Text className="text-white text-center font-semibold">
        {t('youAreOutsideTheCollectionArea')}!
      </Text>
    </View>
  );
}
