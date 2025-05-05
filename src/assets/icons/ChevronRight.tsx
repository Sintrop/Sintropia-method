import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { IconBaseProps } from '../../components/Icon/Icon';

export function ChevronRightIcon({ color = 'black', size = 20 }: IconBaseProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 6L15 12L9 18"
        stroke="#000000"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
