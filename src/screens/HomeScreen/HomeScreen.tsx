import React from 'react'
import { useTranslation } from 'react-i18next'
import { View, Text } from 'react-native'
import i18next from 'i18next'

export function HomeScreen(): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <View>
      <Text className="text-red-500">{t('helloWorld')}</Text>

      <Text onPress={() => i18next.changeLanguage('pt')}>Português</Text>
      <Text onPress={() => i18next.changeLanguage('en')}>English</Text>
    </View>      
  )
}
