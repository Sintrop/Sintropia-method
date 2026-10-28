import React from 'react';
import { Text, View } from 'react-native';

type Tone = 'brand' | 'warning' | 'danger' | 'neutral' | 'info';

const toneClasses: Record<Tone, [string, string]> = {
  brand: ['bg-brand-soft', 'text-brand-dark'],
  warning: ['bg-warning-soft', 'text-warning'],
  danger: ['bg-danger-soft', 'text-danger'],
  neutral: ['bg-canvas', 'text-muted'],
  info: ['bg-[#E5F3FF]', 'text-[#0369A1]'],
};

interface Props {
  label: string;
  tone?: Tone;
}

export function Badge({ label, tone = 'neutral' }: Props) {
  const [container, text] = toneClasses[tone];
  return (
    <View className={`self-start rounded-full px-2.5 py-1 ${container}`}>
      <Text className={`text-xs font-semibold ${text}`}>{label}</Text>
    </View>
  );
}
