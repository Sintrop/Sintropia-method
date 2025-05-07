import React from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

interface Props {
  samplingNumber: number
}
export function SamplingIndicator({ samplingNumber }: Props) {
  const { t } = useTranslation();
  return (
    <View className="absolute top-9 left-0 w-full items-center px-5 z-20">
      <View className="rounded-2xl w-full p-3 bg-white">
        <Text className="font-bold text-black text-lg">{t('sampling')} #{samplingNumber}</Text>
      </View>
    </View>
  );
}
