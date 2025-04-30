import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { TutorialScreen } from "../screens/inspection/TutorialScreen/TutorialScreen";
import { ChooseColectScreen } from "../screens/inspection/ChooseColectScreen/ChooseColectScreen";

export type InspectionStackParamsList = {
  TutorialScreen: undefined;
  ChooseColectScreen: undefined;
}
const Stack = createNativeStackNavigator<InspectionStackParamsList>();

export function InspectionRoutes() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="TutorialScreen" component={TutorialScreen} />
      <Stack.Screen name="ChooseColectScreen" component={ChooseColectScreen} />
    </Stack.Navigator>
  )
}