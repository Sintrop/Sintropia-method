import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Screen } from '../../../components/Screen/Screen';
import { useTranslation } from 'react-i18next';
import { HeaderInspectionMode } from '../components/HeaderInspectionMode';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { InspectionStackParamsList } from '../../../routes/InspectionRoutes';

type ScreenProps = NativeStackScreenProps<InspectionStackParamsList, 'ChooseColectScreen'>
export function ChooseColectScreen({ navigation }: ScreenProps) {
  const { t } = useTranslation();

  function handleGoToRealizeInspection(method: 'manual' | 'sampling') {
    navigation.navigate('RealizeInspectionScreen', {
      collectionMethod: method
    });
  }

  return (
    <Screen screenTitle={t('collectionMethod')} showBackButton>
      <HeaderInspectionMode />

      <View className="w-full items-center mt-10">
        <Text className="font-bold text-black text-xl">
          {t('howWouldYouLikeCollectData')}
        </Text>
        <Text className="mt-10 text-lg text-center">
          {t('descHowWouldYouLikeCollectData')}
        </Text>
      </View>

      <View className="w-full flex-row items-center mt-10">
        <TouchableOpacity
          className="w-[48%] h-12 rounded-2xl items-center justify-center bg-gray-300"
          onPress={() => handleGoToRealizeInspection('manual')}
        >
          <Text className="text-black font-semibold">{t('manual')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="w-[48%] h-12 rounded-2xl items-center justify-center ml-3 bg-gray-300"
          onPress={() => handleGoToRealizeInspection('sampling')}
        >
          <Text className="text-black font-semibold">{t('sampling')}</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}
