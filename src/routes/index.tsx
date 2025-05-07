import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { AppRoutes } from './AppRoutes'
import { Host } from 'react-native-portalize'

export function Routes(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Host>
        <AppRoutes />
      </Host>
    </NavigationContainer>
  )
}
