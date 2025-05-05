import React from 'react';
import { ChevronLeft } from '../../assets/icons/ChevronLeft';
import { Pressable } from 'react-native';
import { ChevronRightIcon } from '../../assets/icons/ChevronRight';

export interface IconBaseProps {
  size?: number;
  color?: string;
}

interface Props {
  name: IconName;
  size?: number;
  color?: string;
  onPress?: () => void;
}
export function Icon({ name, color, size, onPress }: Props) {
  const IconComponent = icons[name];

  if (onPress) {
    return (
      <Pressable onPress={onPress}>
        <IconComponent color={color} size={size} />
      </Pressable>
    );
  }
  return <IconComponent color={color} size={size} />;
}

const icons = {
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRightIcon
};

export type IconName = keyof typeof icons;
