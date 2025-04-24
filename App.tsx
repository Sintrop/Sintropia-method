import React from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Routes } from './src/routes'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { MainContextProvider } from './src/contexts/MainContext'
import './src/lang/i18n'

export default function App(): React.JSX.Element {
  return (
    <GestureHandlerRootView>
      <SafeAreaProvider>
        <MainContextProvider>
          <Routes />
        </MainContextProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
