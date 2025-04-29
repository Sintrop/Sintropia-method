import React from 'react';
import { View } from 'react-native';
import { Header, HeaderProps } from '../Header/Header';
import { useSafeAreaApp } from '../../hooks/useSafeAreaApp';

interface Props extends HeaderProps {
  children: React.ReactNode;
}
export function Screen({ children, ...headerProps }: Props): React.JSX.Element {
  const { top } = useSafeAreaApp();

  return (
    <View className="flex-1" style={{ paddingTop: top }}>
      <Header {...headerProps} />

      <View className="p-5">{children}</View>
    </View>
  );
}
