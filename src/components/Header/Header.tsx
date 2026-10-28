import React, { ReactNode } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Icon } from '../Icon/Icon';
import { useMainContext } from '../../hooks/useMainContext';

//@ts-ignore
import LogoEn from '../../assets/images/syntropy-method-en.png';
//@ts-ignore
import LogoPt from '../../assets/images/syntropy-method-pt.png';

export interface HeaderProps {
  screenTitle: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  homeScreen?: boolean;
  right?: ReactNode;
}
export function Header({
  screenTitle,
  subtitle,
  showBackButton,
  onBack,
  homeScreen,
  right,
}: HeaderProps): React.JSX.Element {
  const navigation = useNavigation();
  const { language } = useMainContext();

  if (homeScreen) {
    return (
      <View className="flex-row items-center justify-between h-16 px-5">
        <Image
          source={language === 'pt' ? LogoPt : LogoEn}
          style={{ width: 120, height: 44 }}
          resizeMode="contain"
        />
        {right}
      </View>
    );
  }

  return (
    <View className="flex-row items-center h-14 px-3">
      <View className="w-11">
        {showBackButton && (
          <TouchableOpacity
            onPress={onBack ?? navigation.goBack}
            className="w-10 h-10 rounded-full bg-surface border border-line items-center justify-center"
            hitSlop={8}
          >
            <Icon name="chevronLeft" size={22} />
          </TouchableOpacity>
        )}
      </View>
      <View className="flex-1 items-center">
        <Text className="font-bold text-ink text-base" numberOfLines={1}>
          {screenTitle}
        </Text>
        {subtitle && (
          <Text className="text-xs text-muted" numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
      <View className="w-11 items-end">{right}</View>
    </View>
  );
}
