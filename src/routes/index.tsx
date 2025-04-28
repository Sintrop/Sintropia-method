import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { Host } from 'react-native-portalize'
import { PreInspectionRoutes } from './PreInspectionRoutes'

export function Routes(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Host>
        <PreInspectionRoutes />
      </Host>
    </NavigationContainer>
  )
}
