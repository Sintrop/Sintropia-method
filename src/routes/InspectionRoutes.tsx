import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TutorialScreen } from '../screens/inspection/TutorialScreen/TutorialScreen';
import { ReportScreen } from '../screens/inspection/ReportScreen/ReportScreen';
import { CollectionScreen } from '../screens/inspection/CollectionScreen/CollectionScreen';
import { AreaDBProps } from '../types/database';

export type InspectionStackParamsList = {
  CollectionScreen: undefined;
  TutorialScreen: undefined;
  ReportScreen: {
    collectionMethod: string;
    area: AreaDBProps;
  };
};

const Stack = createNativeStackNavigator<InspectionStackParamsList>();

export function InspectionRoutes() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CollectionScreen" component={CollectionScreen} />
      <Stack.Screen
        name="TutorialScreen"
        component={TutorialScreen}
        options={{ presentation: 'fullScreenModal' }}
      />
      <Stack.Screen name="ReportScreen" component={ReportScreen} />
    </Stack.Navigator>
  );
}
