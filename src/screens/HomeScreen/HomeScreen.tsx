import React from 'react'
import { useTranslation } from 'react-i18next'
import { View, Text } from 'react-native'
import i18next from 'i18next'
import { Screen } from '../../components/Screen/Screen'
import { useMainContext } from '../../hooks/useMainContext'

export function HomeScreen(): React.JSX.Element {
  const { t } = useTranslation()
  const { language } = useMainContext()

  return (
    <Screen screenTitle="Home Screen">
      <Text className="text-red-500">{t('helloWorld')} - {language}</Text>

      <Text onPress={() => i18next.changeLanguage('pt')}>Português</Text>
      <Text onPress={() => i18next.changeLanguage('en')}>English</Text>
    </Screen>      
  )
}
