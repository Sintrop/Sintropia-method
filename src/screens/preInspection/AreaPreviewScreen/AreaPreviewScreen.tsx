import React from "react";
import { Text } from "react-native";
import { Screen } from "../../../components/Screen/Screen";
import { useTranslation } from "react-i18next";

export function AreaPreviewScreen() {
  const {t} = useTranslation()

  return (
    <Screen screenTitle={t('areaPreview')} showBackButton>
      <Text>Area Preview</Text>
    </Screen>
  )
}
