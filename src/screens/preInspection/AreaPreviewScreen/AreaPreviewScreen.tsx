import React from 'react';
import {ActivityIndicator, Text, TouchableOpacity, View} from 'react-native';
import {Screen} from '../../../components/Screen/Screen';
import {useTranslation} from 'react-i18next';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {PreInspectionStackParamsList} from '../../../routes/PreInspectionRoutes';

type ScreenProps = NativeStackScreenProps<
  PreInspectionStackParamsList,
  'AreaPreviewScreen'
>;
export function AreaPreviewScreen({route}: ScreenProps) {
  const {coords} = route.params;
  const {t} = useTranslation();

  return (
    <Screen screenTitle={t('areaPreview')} showBackButton>
      <View className="w-full h-[250px] bg-red-500" />

      <View className="p-3 rounded-2xl border mt-5">
        <Text>{t('coordinates')}</Text>
        {coords.map((item, index) => (
          <Text key={index} className="mb-1">
            Lat: {item.latitude}, Lng: {item.longitude}
          </Text>
        ))}
      </View>

      <TouchableOpacity
        className="w-full h-[48] bg-[#229B13] flex items-center justify-center rounded-2xl mt-10"
      >
        {false ? (
          <ActivityIndicator color="white" size={30} />
        ) : (
          <Text className="font-semibold text-white">{t('startInspection')}</Text>
        )}
      </TouchableOpacity>
    </Screen>
  );
}
