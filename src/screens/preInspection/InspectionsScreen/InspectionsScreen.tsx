import React from "react";
import { Text } from "react-native";
import { Screen } from "../../../components/Screen/Screen";
import { useTranslation } from "react-i18next";

export function InspectionsScreen() {
  const {t} = useTranslation()

  return (
    <Screen screenTitle={t('inspections')}>
      <Text>Inspections</Text>
    </Screen>
  )
}
