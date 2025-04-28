import React from 'react'
import { Text, View } from 'react-native'
import { Icon } from '../Icon/Icon'
import { useNavigation } from '@react-navigation/native'

export interface HeaderProps {
  screenTitle: string
  showBackButton?: boolean
}
export function Header({ screenTitle, showBackButton }: HeaderProps): React.JSX.Element {
  const navigation = useNavigation()

  return (
    <View className="flex-row items-center justify-between h-14 border-b px-5">
      <View className="w-10">
        {showBackButton && (
          <Icon
            name="chevronLeft"
            size={25}
            color="white"
            onPress={navigation.goBack}
          />
        )}
      </View>
      <Text className="font-semibold text-black">{screenTitle}</Text>
      <View className="w-10" />
    </View>
  )
}