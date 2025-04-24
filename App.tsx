import React from 'react'
import { Routes } from './src/routes'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import './src/lang/i18n'
import { MainContextProvider } from './src/contexts/MainContext'

export default function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <MainContextProvider>
        <Routes />
      </MainContextProvider>
    </SafeAreaProvider>
  )
}
