import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { HomeScreen } from '../screens/HomeScreen/HomeScreen'

const Stack = createNativeStackNavigator()

export function AppRoutes(): React.JSX.Element {
	return (
		<Stack.Navigator>
			<Stack.Screen name="HomeScreen" component={HomeScreen} />
		</Stack.Navigator>
	)
}
