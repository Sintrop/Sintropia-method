import React from "react";
import { View, Image, Text } from "react-native";
import { BiodiversityDBProps } from "../../../../types/database";
import { useTranslation } from "react-i18next";
import { CoordinateProps } from "../../../../types/regenerator";

interface Props {
  biodiversity?: BiodiversityDBProps;
}
export function RegisterItem({ biodiversity }: Props) {
  const {t} = useTranslation();

  const coordinate: CoordinateProps = {
    latitude: biodiversity ? JSON.parse(biodiversity.coordinate).latitude : '0', 
    longitude: biodiversity ? JSON.parse(biodiversity.coordinate).longitude : '0'
  }

  return (
    <View className="w-full rounded-2xl p-3 flex-row bg-gray-200">
      <View className="w-20 h-20 border rounded-2xl overflow-hidden ">
        <Image
          source={{ uri: biodiversity?.photo }}
          className="w-full h-full"
          resizeMode="cover"
        />
      </View>

      <View className="ml-3">
        <Text className="text-xs">{t('coordinate')}</Text>
        <Text className="text-black text-sm">Lat: {coordinate?.latitude}, Lng: {coordinate?.longitude}</Text>

        <Text className="text-xs mt-1">{t('specie')}</Text>
        <Text className="text-black text-sm">ID= 0 - indefinido</Text>
      </View>
    </View>
  );
}
