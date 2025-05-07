import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SamplingDBProps } from "../../../../../types/database";
import { useTranslation } from "react-i18next";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { InspectionStackParamsList } from "../../../../../routes/InspectionRoutes";
import { useNavigation } from "@react-navigation/native";

interface Props {
  sampling: SamplingDBProps;
}

type NavigationProps = NativeStackNavigationProp<InspectionStackParamsList>
export function SamplingListItem({ sampling }: Props) {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProps>();

  function handleGoToInspection() {
    navigation.navigate('RealizeInspectionScreen', {
      collectionMethod: 'sampling',
      sampling
    })
  }

  return (
    <TouchableOpacity 
      className="w-full rounded-2xl bg-gray-200 p-3 mb-5"
      onPress={handleGoToInspection}
    >
      <Text className="font-bold text-black">
        {t('sampling')} #{sampling.number}
      </Text>
    </TouchableOpacity>
  );
} 
