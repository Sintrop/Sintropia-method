import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { IconBaseProps } from '../../components/Icon/Icon';

export function CloseIcon({ color = 'black', size = 20 }: IconBaseProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 18L12 12M12 12L6 6M12 12L18 6M12 12L6 18"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={color}
      />
    </Svg>
  );
}
