import React from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {Routes} from './src/routes';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {MainContextProvider} from './src/contexts/MainContext';
import {InspectionContextProvider} from './src/contexts/InspectionContext';
import './src/lang/i18n';
import 'react-native-get-random-values';
import 'text-encoding';

export default function App(): React.JSX.Element {
  return (
    <GestureHandlerRootView>
      <SafeAreaProvider>
        <MainContextProvider>
          <InspectionContextProvider>
            <Routes />
          </InspectionContextProvider>
        </MainContextProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
