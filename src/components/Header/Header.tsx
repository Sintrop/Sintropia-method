import React from 'react'
import { Text, View } from 'react-native'

interface Props {
  screenTitle: string
}
export function Header({ screenTitle }: Props): React.JSX.Element {
  return (
    <View className="flex items-center justify-between h-14 border-b">
      <View />
      <Text className="font-semibold text-black">{screenTitle}</Text>
      <View />
    </View>
  )
}