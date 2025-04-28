import React from "react";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";
import { Screen } from "../../../components/Screen/Screen";
import { LanguageSelector } from "../../../components/LanguageSelector/LanguageSelector";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { PreInspectionStackParamsList } from "../../../routes/PreInspectionRoutes";

type ScreenProps = NativeStackScreenProps<PreInspectionStackParamsList, 'HomeScreen'>
export function HomeScreen({ navigation }: ScreenProps): React.JSX.Element {
  const { t } = useTranslation();

  function handleGoToInspectionsScreen() {
    navigation.navigate('InspectionsScreen')
  }

  return (
    <Screen screenTitle="Home Screen">
      <View className="items-end">
        <LanguageSelector />
      </View>

      <View className="items-center">
        <Text className="text-black text-center mt-10">
          {t("whichAreaDoYouWantToInspect")}
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
    </Screen>
  );
}
