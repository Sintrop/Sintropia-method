import React from "react";
import { useTranslation } from "react-i18next";
import { View, Text } from "react-native";

interface Props {

}
export function Calculation({}: Props) {
  const { t } = useTranslation();

  return (
    <View className="w-full border rounded-2xl p-3 mt-5">
      <Text className="text-center text-black mt-3 font-semibold mb-3">
        {t('treesResult')}
      </Text>

      <Text className="text-center text-black">
        Ai = {t('inspectedArea')}
      </Text>
      <Text className="text-center text-black">
        P1 = {t('samplingTrees1')}
      </Text>
      <Text className="text-center text-black">
        Pn = {t('samplingTreesN')}
      </Text>
      <Text className="text-center text-black">
        Ap = {t('samplingArea')}
      </Text>
      <Text className="text-center text-black">
        n = {t('numberOfSamplings')}
      </Text>

      <Text className="text-center text-black mt-3 font-semibold">
        {t('result')} =  {`{[(P1 +...+ Pn) / n] * Ai} / Ap`}
      </Text>
    </View>
  );
}
