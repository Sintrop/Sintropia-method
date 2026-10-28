import React from 'react';
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native';
import colors from '../../theme/colors';
import { Icon, IconName } from '../Icon/Icon';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const containerByVariant: Record<Variant, string> = {
  primary: 'bg-brand',
  secondary: 'bg-surface border border-line',
  ghost: 'bg-transparent',
  danger: 'bg-danger-soft',
};

const textByVariant: Record<Variant, string> = {
  primary: 'text-white',
  secondary: 'text-ink',
  ghost: 'text-brand',
  danger: 'text-danger',
};

const iconColorByVariant: Record<Variant, string> = {
  primary: '#FFFFFF',
  secondary: colors.ink,
  ghost: colors.brand,
  danger: colors.danger,
};

interface Props extends TouchableOpacityProps {
  title: string;
  variant?: Variant;
  icon?: IconName;
  loading?: boolean;
  compact?: boolean;
}

export function AppButton({
  title,
  variant = 'primary',
  icon,
  loading,
  compact,
  disabled,
  style,
  ...rest
}: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled || loading}
      className={`flex-row items-center justify-center rounded-2xl px-5 ${
        compact ? 'h-11' : 'h-14'
      } ${containerByVariant[variant]}`}
      style={[{ opacity: disabled ? 0.45 : 1 }, style]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={iconColorByVariant[variant]} />
      ) : (
        <>
          {icon && (
            <View className="mr-2">
              <Icon name={icon} color={iconColorByVariant[variant]} size={20} />
            </View>
          )}
          <Text
            className={`font-semibold ${compact ? 'text-sm' : 'text-base'} ${
              textByVariant[variant]
            }`}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}
