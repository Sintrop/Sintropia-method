import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { InspectionStackParamsList } from "../routes/InspectionRoutes";

type NavigationProps = NativeStackNavigationProp<InspectionStackParamsList>
export function useResetNavigation() {
  const navigation = useNavigation<NavigationProps>();

  function resetToSelectStepScreen(collectionMethod: string) {
    navigation.reset({
      index: 0,
      routes: [{ name: 'SelectStepScreen', params: { collectionMethod } }]
    });
  };

  return {
    resetToSelectStepScreen
  }
}
