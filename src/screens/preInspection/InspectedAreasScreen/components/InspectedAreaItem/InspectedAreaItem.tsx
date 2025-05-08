import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { AreaDBProps } from "../../../../../types/database";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { PreInspectionStackParamsList } from "../../../../../routes/PreInspectionRoutes";
import { useNavigation } from "@react-navigation/native";

interface Props {
  area: AreaDBProps;
}

type NavigationProps = NativeStackNavigationProp<PreInspectionStackParamsList>
export function InspectedAreaItem({ area }: Props) {
  const navigation = useNavigation<NavigationProps>();

  function handleGoToReportScreen() {
    navigation.navigate('ReportScreen', {
      collectionMethod: area?.collectionMethod,
      area: area,
    })
  }

  return (
    <TouchableOpacity
      className="w-full border-b px-2 py-2"
      onPress={handleGoToReportScreen}
    >
      <Text className="font-semibold text-black">Area - {area.name}</Text>
    </TouchableOpacity>
  );
}
