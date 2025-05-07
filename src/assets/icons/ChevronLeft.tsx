import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { IconBaseProps } from '../../components/Icon/Icon';

export function ChevronLeft({ color = 'black', size = 20 }: IconBaseProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 6L9 12L15 18"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
