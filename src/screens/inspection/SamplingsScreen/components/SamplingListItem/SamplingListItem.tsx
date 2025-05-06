import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SamplingDBProps } from "../../../../../types/database";
import { useTranslation } from "react-i18next";

interface Props {
  sampling: SamplingDBProps;
}

export function SamplingListItem({ sampling }: Props) {
  const { t } = useTranslation();

  return (
    <TouchableOpacity className="w-full rounded-2xl bg-gray-200 p-3 mb-5">
      <Text className="font-bold text-black">
        {t('sampling')} #{sampling.number}
      </Text>
    </TouchableOpacity>
  );
} 
