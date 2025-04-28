import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {HomeScreen} from '../screens/preInspection/HomeScreen/HomeScreen';
import {SearchInspectionScreen} from '../screens/preInspection/SearchInspectionScreen/SearchInspectionScreen';
import {InspectionsListScreen} from '../screens/preInspection/InspectionsListScreen/InspectionsListScreen';
import {AreaPreviewScreen} from '../screens/preInspection/AreaPreviewScreen/AreaPreviewScreen';

export type PreInspectionStackParamsList = {
  HomeScreen: undefined;
  SearchInspectionScreen: undefined;
  InspectionsListScreen: undefined;
  AreaPreviewScreen: undefined;
};

const Stack = createNativeStackNavigator<PreInspectionStackParamsList>();

export function PreInspectionRoutes() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
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
    </Stack.Navigator>
  );
}
