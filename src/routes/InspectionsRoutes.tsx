import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { TutorialScreen } from "../screens/inspection/TutorialScreen/TutorialScreen";

export type InspectionsStackParamsList = {
  TutorialScreen: undefined;
}
const Stack = createNativeStackNavigator<InspectionsStackParamsList>();

export function InspectionsRoutes() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="TutorialScreen" component={TutorialScreen} />
    </Stack.Navigator>
  )
}