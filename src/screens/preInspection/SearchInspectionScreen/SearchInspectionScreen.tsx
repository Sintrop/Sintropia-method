import React, {useState} from 'react';
import {Text, TextInput, TouchableOpacity, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Screen} from '../../../components/Screen/Screen';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {PreInspectionStackParamsList} from '../../../routes/PreInspectionRoutes';

type ScreenProps = NativeStackScreenProps<
  PreInspectionStackParamsList,
  'SearchInspectionScreen'
>;
export function SearchInspectionScreen({navigation}: ScreenProps) {
  const {t} = useTranslation();
  const [id, setId] = useState('');

  function handleGoToInspectionsList(){
    navigation.navigate('InspectionsListScreen')
  }

  return (
    <Screen screenTitle={t('searchInspection')} showBackButton>
      <Text>{t('searchInspectionByID')}</Text>
      <View className="flex-row mt-1">
        <TextInput
          value={id}
          onChangeText={setId}
          placeholder={t('typeIDHere')}
          placeholderTextColor="#aaa"
          className="flex-1 h-[48] rounded-2xl border px-5"
          keyboardType="numeric"
        />

        <TouchableOpacity className="px-10 h-[48] bg-[#229B13] flex items-center justify-center rounded-2xl ml-5">
          <Text className="font-semibold text-white">{t('search')}</Text>
        </TouchableOpacity>
      </View>

      <Text className="mt-10">{t('or')}</Text>

      <TouchableOpacity
        className="px-10 h-[48] border border-[#229B13] flex items-center justify-center rounded-2xl"
        onPress={handleGoToInspectionsList}
      >
        <Text className="font-semibold text-[#229B13]">
          {t('accessListOfInspections')}
        </Text>
      </TouchableOpacity>
    </Screen>
  );
}
