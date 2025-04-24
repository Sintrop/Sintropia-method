import React from 'react'
import { useTranslation } from 'react-i18next'
import { Text } from 'react-native'
import { Screen } from '../../components/Screen/Screen'
import { LanguageSelector } from '../../components/LanguageSelector/LanguageSelector'

export function HomeScreen(): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <Screen screenTitle="Home Screen">
      <Text className="text-red-500">{t('helloWorld')}</Text>
      <LanguageSelector />
    </Screen>      
  )
}
