import React from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

interface Props {
  step: Steps;
}
export function StepCard({ step }: Props) {
  const {t} = useTranslation();

  const data = steps[step];

  return (
    <View className="w-full items-center">
      <Text className="font-bold text-black text-xl">{t(data?.title)}</Text>
      <Text className="mt-10 text-lg text-center">{t(data.description)}</Text>
    </View>
  )
}

const steps = {
  1: {
    title: 'overview',
    description: 'overviewDescription',
  },
  2: {
    title: 'treesResult',
    description: 'treesResultDescription',
  },
  3: {
    title: 'biodiversityResult',
    description: 'biodiversityResultDescription',
  },
  4: {
    title: 'report',
    description: 'reportDescription',
  }
}

export type Steps = keyof typeof steps
