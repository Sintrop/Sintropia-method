import React from "react";
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";

export function Subtitle() {
  const { t } = useTranslation();

  return (
    <View className="rounded-2xl px-3 py-1 bg-white mt-3 w-[120]">
      <Text className="text-sm text-gray-500">{t('subtitle')}</Text>
      <View className="flex-row items-center">
        <View className="w-3 h-3 rounded-full bg-green-600 border"/>
        <Text className="text-black ml-2">{t('trees')}</Text>
      </View>

      <View className="flex-row items-center">
        <View className="w-3 h-3 rounded-full bg-yellow-600 border"/>
        <Text className="text-black ml-2">{t('biodiversity')}</Text>
      </View>
    </View>
  )
}
