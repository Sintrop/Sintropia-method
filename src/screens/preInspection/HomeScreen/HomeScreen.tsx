import React from 'react';
import { Text, TouchableOpacity, View, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Screen } from '../../../components/Screen/Screen';
import { LanguageSelector } from '../../../components/LanguageSelector/LanguageSelector';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PreInspectionStackParamsList } from '../../../routes/PreInspectionRoutes';
import { useInspectionContext } from '../../../hooks/useInspectionContext';
import { DeleteInspection } from '../../inspection/SelectStepScreen/components/DeleteInspection/DeleteInspection';
import { useMainContext } from '../../../hooks/useMainContext';

type ScreenProps = NativeStackScreenProps<
  PreInspectionStackParamsList,
  'HomeScreen'
>;
export function HomeScreen({ navigation }: ScreenProps): React.JSX.Element {
  const { areaOpened, enterInspectionMode } = useInspectionContext();
  const { t } = useTranslation();
  const { language } = useMainContext();

  function handleGoToInspectionsScreen() {
    navigation.navigate('SearchInspectionScreen');
  }

  function handleGoToInspectedAreasScreen() {
    navigation.navigate('InspectedAreasScreen');
  }

  function handleOpenPrivacyPolicy() {
    Linking.openURL(
      `https://regenerationcredit.org/${language.toLowerCase()}/methods/sintropia/privacy-policy`,
    );
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
              onPress={enterInspectionMode}
            >
              <Text className="font-semibold text-white">{t('continue')}</Text>
            </TouchableOpacity>

            <DeleteInspection areaId={areaOpened.id} />
          </View>
        ) : (
          <View>
            <Text className="text-black text-center mt-10">
              {t('whichAreaDoYouWantToInspect')}
            </Text>

            <TouchableOpacity
              className="w-[320] h-[48] rounded-2xl bg-[#229B13] flex items-center justify-center mt-5"
              onPress={handleGoToInspectionsScreen}
            >
              <Text className="font-semibold text-white">
                {t('selectInspection')}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <Text className="mt-10 text-gray-500">
          {t('seeYourAreasAlreadyInspected')}
        </Text>
        <TouchableOpacity
          className="w-[320] h-[48] rounded-2xl border border-[#229B13] flex items-center justify-center mt-1"
          onPress={handleGoToInspectedAreasScreen}
        >
          <Text className="font-semibold text-[#229B13]">
            {t('inspectedAreas')}
          </Text>
        </TouchableOpacity>

        <View className="flex items-center justify-center mt-10">
          <TouchableOpacity onPress={handleOpenPrivacyPolicy}>
            <Text className="underline text-blue-600 text-sm">
              {t('homeScreen.privacyPolicy')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  );
}
