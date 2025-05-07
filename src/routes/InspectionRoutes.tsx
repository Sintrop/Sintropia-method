import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { TutorialScreen } from "../screens/inspection/TutorialScreen/TutorialScreen";
import { ChooseColectScreen } from "../screens/inspection/ChooseColectScreen/ChooseColectScreen";
import { RealizeInspectionScreen } from "../screens/inspection/RealizeInspectionScreen/RealizeInspectionScreen";
import { ReportScreen } from "../screens/inspection/ReportScreen/ReportScreen";
import { SelectStepScreen } from "../screens/inspection/SelectStepScreen/SelectStepScreen";
import { SamplingsScreen } from "../screens/inspection/SamplingsScreen/SamplingsScreen";
import { CoordinateProps } from "../types/regenerator";
import { SamplingDBProps } from "../types/database";

export type InspectionStackParamsList = {
  TutorialScreen: undefined;
  ChooseColectScreen: undefined;
  RealizeInspectionScreen: {
    collectionMethod: string;
    sampling: SamplingDBProps;
    collectOnlyBio?: boolean;
  }
  ReportScreen: {
    collectionMethod: string;
  }
  SelectStepScreen: {
    collectionMethod: string;
  }
  SamplingsScreen: {
    areaId: number;
    areaCoordinates: CoordinateProps[];
  }
}

const Stack = createNativeStackNavigator<InspectionStackParamsList>();

export function InspectionRoutes() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="TutorialScreen" component={TutorialScreen} />
      <Stack.Screen name="ChooseColectScreen" component={ChooseColectScreen} />
      <Stack.Screen name="RealizeInspectionScreen" component={RealizeInspectionScreen} />
      <Stack.Screen name="ReportScreen" component={ReportScreen} />
      <Stack.Screen name="SelectStepScreen" component={SelectStepScreen} />
      <Stack.Screen name="SamplingsScreen" component={SamplingsScreen} />
    </Stack.Navigator>
  )
}
