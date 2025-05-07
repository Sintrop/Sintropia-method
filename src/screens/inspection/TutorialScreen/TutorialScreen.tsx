import React, { useState } from "react";
import { Screen } from "../../../components/Screen/Screen";
import { useTranslation } from "react-i18next";
import { StepCard, Steps } from "./components/StepCard";
import { Buttons } from "./components/Buttons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { InspectionStackParamsList } from "../../../routes/InspectionRoutes";
import { HeaderInspectionMode } from "../components/HeaderInspectionMode";

type ScreenProps = NativeStackScreenProps<InspectionStackParamsList, 'TutorialScreen'>
export function TutorialScreen({ navigation }: ScreenProps) {
  const {t} = useTranslation();
  const [step, setStep] = useState<Steps>(1);

  function handleNextStep() {
    if (step === 4) return;
    setStep((value) => value + 1 as Steps);
  }

  function handlePreviousStep() {
    if (step === 1) return;
    setStep((value) => value - 1 as Steps);
  }

  function handleGoToChooseColect() {
    navigation.navigate('ChooseColectScreen');
  }

  return (
    <Screen screenTitle={t('tutorial')}>
      <HeaderInspectionMode />

      <StepCard step={step} />

      <Buttons
        step={step}
        nextStep={handleNextStep}
        previousStep={handlePreviousStep}
        goToChooseColect={handleGoToChooseColect}
      />
    </Screen>
  );
}
