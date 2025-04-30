import React from "react";
import { useTranslation } from "react-i18next";
import { View, TouchableOpacity, Text } from "react-native";
import { Steps } from "./StepCard";

interface Props {
  step: Steps;
  nextStep: () => void;
  previousStep: () => void;
  goToChooseColect: () => void;
}
export function Buttons({ step, nextStep, previousStep, goToChooseColect }: Props) {
  const {t} = useTranslation();

  return (
    <View className="w-full flex-row items-center mt-10">
      <TouchableOpacity
        className="w-[48%] h-12 rounded-2xl items-center justify-center"
        style={{opacity: step === 1 ? 0.5 : 1}}
        onPress={previousStep}
        disabled={step === 1}
      >
        <Text className="text-black">{t('previous')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="w-[48%] h-12 rounded-2xl items-center justify-center ml-3 bg-[#229B13]"
        onPress={step === 4 ? goToChooseColect : nextStep}
      >
        <Text className="text-white font-semibold">
          {t(step === 4 ? 'start' : 'next')}
        </Text>
      </TouchableOpacity>
    </View>
  )
}
