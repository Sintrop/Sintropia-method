import React from 'react'
import { View } from 'react-native'
import { Header } from '../Header/Header'
import { useSafeAreaApp } from '../../hooks/useSafeAreaApp'

interface Props {
	children: React.ReactNode
	screenTitle: string
}
export function Screen({ children, screenTitle }: Props): React.JSX.Element {
	const { top } = useSafeAreaApp()

	return (
		<View 
			className="flex-1"
			style={{ paddingTop: top }}
		>
			<Header screenTitle={screenTitle} />

			<View className="p-5">
				{children}
			</View>
		</View>
	)
}
