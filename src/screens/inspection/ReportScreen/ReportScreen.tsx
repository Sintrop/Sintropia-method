import React from "react";
import { Text } from "react-native";
import { Screen } from "../../../components/Screen/Screen";
import { useTranslation } from "react-i18next";

export function ReportScreen() {
  const { t } = useTranslation();

  return (
    <Screen screenTitle={t('report')} showBackButton>
      <Text>Report Screen</Text>
    </Screen>
  );
}
