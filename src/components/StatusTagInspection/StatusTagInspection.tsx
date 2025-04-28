import React from 'react'
import { View, Text } from 'react-native'
import { useTranslation } from 'react-i18next'

interface Props {
  status: number
}
export function StatusTagInspection({ status }: Props) {
  const { t } = useTranslation()

  if (status === 0) {
    return (
      <View className="px-5 h-7 w-fit rounded-2xl items-center justify-center bg-orange-500">
        <Text className="text-white font-semibold">{t('open')}</Text>
      </View>
    )
  }

  return <View />
}
