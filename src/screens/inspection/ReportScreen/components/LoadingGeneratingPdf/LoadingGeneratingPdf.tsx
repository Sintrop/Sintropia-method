import React from "react"
import { useTranslation } from "react-i18next"
import { Modal, View, Text } from "react-native"

interface Props {
  percentage: number
  message: string
}

export function LoadingGeneratingPdf({ percentage, message }: Props) {
  const { t } = useTranslation()

  return (
    <Modal
      visible={true}
      animationType="fade"
      transparent
    > 
      <View className="flex-1 items-center justify-center bg-black/50">
        <View className="w-[250] h-[150] bg-white rounded-2xl p-5">
          <Text className="text-center text-black">{t('generatingPDF')}</Text>

          <Text className="font-bold text-black text-4xl text-center mt-5">{percentage} %</Text>

          <Text className="text-center text-black">{t(message)}...</Text>
        </View>
      </View>
    </Modal>
  )
}
