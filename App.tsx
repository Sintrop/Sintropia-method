import React from 'react'
import { Routes } from './src/routes'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import './src/lang/i18n'

export default function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <Routes />
    </SafeAreaProvider>
  )
}
