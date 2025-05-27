import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/preInspection/HomeScreen/HomeScreen';
import { SearchInspectionScreen } from '../screens/preInspection/SearchInspectionScreen/SearchInspectionScreen';
import { InspectionsListScreen } from '../screens/preInspection/InspectionsListScreen/InspectionsListScreen';
import { AreaPreviewScreen } from '../screens/preInspection/AreaPreviewScreen/AreaPreviewScreen';
import { InspectionProps } from '../types/inspection';
import { CoordinateProps, RegeneratorProps } from '../types/regenerator';
import { InspectedAreasScreen } from '../screens/preInspection/InspectedAreasScreen/InspectedAreasScreen';
import { AreaDBProps } from '../types/database';
import { ReportScreen } from '../screens/inspection/ReportScreen/ReportScreen';

export type PreInspectionStackParamsList = {
  HomeScreen: undefined;
  SearchInspectionScreen: undefined;
  InspectionsListScreen: undefined;
  AreaPreviewScreen: {
    inspection: InspectionProps;
    regenerator: RegeneratorProps;
    coords: CoordinateProps[];
    areaSize: number;
  };
  InspectedAreasScreen: undefined;
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
        name="SearchInspectionScreen"
        component={SearchInspectionScreen}
      />
      <Stack.Screen
        name="InspectionsListScreen"
        component={InspectionsListScreen}
      />
      <Stack.Screen name="AreaPreviewScreen" component={AreaPreviewScreen} />
      <Stack.Screen
        name="InspectedAreasScreen"
        component={InspectedAreasScreen}
      />
      <Stack.Screen name="ReportScreen" component={ReportScreen} />
    </Stack.Navigator>
  );
}
