import React, { ReactNode } from 'react';
import { View, ViewProps } from 'react-native';

interface Props extends ViewProps {
  children: ReactNode;
}

// Spacing passed through className reaches here as `style` (NativeWind wraps
// custom components), so it is merged after the base classes.
export function Card({ children, ...rest }: Props) {
  return (
    <View className="bg-surface rounded-3xl border border-line p-4" {...rest}>
      {children}
    </View>
  );
}
