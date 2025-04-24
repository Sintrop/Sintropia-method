import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { AppRoutes } from './AppRoutes'

export function Routes(): React.JSX.Element {
  return (
    <NavigationContainer>
      <AppRoutes />
    </NavigationContainer>
  )
}
