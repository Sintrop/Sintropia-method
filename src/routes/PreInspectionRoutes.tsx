import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/preInspection/HomeScreen/HomeScreen';
import { RegeneratorsListScreen } from '../screens/preInspection/RegeneratorsListScreen/RegeneratorsListScreen';
import { AreaPreviewScreen } from '../screens/preInspection/AreaPreviewScreen/AreaPreviewScreen';
import { CoordinateProps, RegeneratorProps } from '../types/regenerator';
import { AreaDBProps } from '../types/database';
import { ReportScreen } from '../screens/inspection/ReportScreen/ReportScreen';

export type PreInspectionStackParamsList = {
  HomeScreen: undefined;
  RegeneratorsListScreen: undefined;
  AreaPreviewScreen: {
    regenerator: RegeneratorProps;
    coords: CoordinateProps[];
  };
  ReportScreen: {
    collectionMethod: string;
    area: AreaDBProps;
  };
};

const Stack = createNativeStackNavigator<PreInspectionStackParamsList>();

export function PreInspectionRoutes() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen
        name="RegeneratorsListScreen"
        component={RegeneratorsListScreen}
      />
      <Stack.Screen name="AreaPreviewScreen" component={AreaPreviewScreen} />
      <Stack.Screen name="ReportScreen" component={ReportScreen} />
    </Stack.Navigator>
  );
}
