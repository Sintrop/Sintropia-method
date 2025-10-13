import React from 'react';
import { ScrollView, View } from 'react-native';
import { Header, HeaderProps } from '../Header/Header';
import { useSafeAreaApp } from '../../hooks/useSafeAreaApp';

interface Props extends HeaderProps {
  children: React.ReactNode;
  scrollable?: boolean;
}
export function Screen({
  children,
  scrollable,
  ...headerProps
}: Props): React.JSX.Element {
  const { top, bottom } = useSafeAreaApp();

  return (
    <View className="flex-1" style={{ paddingTop: top, paddingBottom: bottom }}>
      <Header {...headerProps} />

      {scrollable ? (
        <ScrollView className="px-5" showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      ) : (
        <View className="p-5">{children}</View>
      )}
    </View>
  );
}
