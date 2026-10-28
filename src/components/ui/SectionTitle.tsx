import React from 'react';
import { StyleProp, Text, View, ViewStyle } from 'react-native';

interface Props {
  title: string;
  subtitle?: string;
  style?: StyleProp<ViewStyle>;
}

export function SectionTitle({ title, subtitle, style }: Props) {
  return (
    <View style={style}>
      <Text className="text-xs font-bold uppercase tracking-widest text-muted">
        {title}
      </Text>
      {subtitle && <Text className="text-sm text-muted mt-1">{subtitle}</Text>}
    </View>
  );
}
