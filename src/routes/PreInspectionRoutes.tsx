import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeScreen } from "../screens/preInspection/HomeScreen/HomeScreen";
import { InspectionsScreen } from "../screens/preInspection/InspectionsScreen/InspectionsScreen";

export type PreInspectionStackParamsList = {
  HomeScreen: undefined
  InspectionsScreen: undefined
}

const Stack = createNativeStackNavigator<PreInspectionStackParamsList>()

export function PreInspectionRoutes() {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
    >
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="InspectionsScreen" component={InspectionsScreen} />
    </Stack.Navigator>
  )
}
