import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useInspectionContext } from '../../../hooks/useInspectionContext';
import { LanguageSelector } from '../../../components/LanguageSelector/LanguageSelector';

export function HeaderInspectionMode() {
  const {t} = useTranslation();
  const {exitInspectionMode} = useInspectionContext();
  
  return (
    <View className="flex-row items-center justify-between w-full mb-2">
      <View>
        <Text className="text-sm text-black">
          {t('youAreInInspectionMode')}
        </Text>
        <Text className="text-blue-500 underline" onPress={exitInspectionMode}>
          {t('touchHereToExit')}
        </Text>
      </View>

      <LanguageSelector />
    </View>
  );
}
