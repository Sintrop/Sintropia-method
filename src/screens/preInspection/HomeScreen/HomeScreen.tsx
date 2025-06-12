import React from 'react';
import {useTranslation} from 'react-i18next';
import {Text, TouchableOpacity, View} from 'react-native';
import {Screen} from '../../../components/Screen/Screen';
import {LanguageSelector} from '../../../components/LanguageSelector/LanguageSelector';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {PreInspectionStackParamsList} from '../../../routes/PreInspectionRoutes';
import { useInspectionContext } from '../../../hooks/useInspectionContext';
import Config from 'react-native-config';

type ScreenProps = NativeStackScreenProps<
  PreInspectionStackParamsList,
  'HomeScreen'
>;
export function HomeScreen({navigation}: ScreenProps): React.JSX.Element {
  const { areaOpened, enterInspectionMode } = useInspectionContext();
  const {t} = useTranslation();
  const version = Config.VERSION;

  function handleGoToInspectionsScreen() {
    navigation.navigate('SearchInspectionScreen');
  }

  function handleGoToInspectedAreasScreen() {
    navigation.navigate('InspectedAreasScreen');
  }

  return (
    <Screen screenTitle="Sintropia" homeScreen>
      <View className="items-end">
        <LanguageSelector />
      </View>

      <View className="items-center">
        {areaOpened ? (
          <View className="">
            <Text className="text-black text-center mt-10">
              {t('youHaveAnOpenedInspection')}
            </Text>

            <TouchableOpacity
              className="w-[320] h-[48] rounded-2xl bg-[#229B13] flex items-center justify-center mt-5"
              onPress={enterInspectionMode}>
              <Text className="font-semibold text-white">
                {t('continue')}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text className="text-black text-center mt-10">
              {t('whichAreaDoYouWantToInspect')}
            </Text>

            <TouchableOpacity
              className="w-[320] h-[48] rounded-2xl bg-[#229B13] flex items-center justify-center mt-5"
              onPress={handleGoToInspectionsScreen}>
              <Text className="font-semibold text-white">
                {t('selectInspection')}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <Text className="mt-10 text-gray-500">{t('seeYourAreasAlreadyInspected')}</Text>
        <TouchableOpacity
          className="w-[320] h-[48] rounded-2xl border border-[#229B13] flex items-center justify-center mt-1"
          onPress={handleGoToInspectedAreasScreen}>
          <Text className="font-semibold text-[#229B13]">
            {t('inspectedAreas')}
          </Text>
        </TouchableOpacity>

        <Text className="mt-10 text-gray-500">v{version}</Text>
      </View>
    </Screen>
  );
}
