import React from 'react';
import { ScrollView, View } from 'react-native';
import { Header, HeaderProps } from '../Header/Header';
import { useSafeAreaApp } from '../../hooks/useSafeAreaApp';

interface Props extends HeaderProps {
  children: React.ReactNode;
  scrollable?: boolean;
  footer?: React.ReactNode;
}
export function Screen({
  children,
  scrollable,
  footer,
  ...headerProps
}: Props): React.JSX.Element {
  const { top, bottom } = useSafeAreaApp();

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: top }}>
      <Header {...headerProps} />

      {scrollable ? (
        <ScrollView
          className="px-5"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: footer ? 24 : bottom + 24 }}
        >
          {children}
        </ScrollView>
      ) : (
        <View className="flex-1 px-5">{children}</View>
      )}

      {footer && (
        <View
          className="px-5 pt-3 bg-canvas border-t border-line"
          style={{ paddingBottom: bottom }}
        >
          {footer}
        </View>
      )}
    </View>
  );
}
