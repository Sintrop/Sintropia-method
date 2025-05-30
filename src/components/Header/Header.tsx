import React from 'react';
import { Image, Text, View } from 'react-native';
import { Icon } from '../Icon/Icon';
import { useNavigation } from '@react-navigation/native';

import LogoEn from '../../assets/images/syntropy-method-en.png';
import LogoPt from '../../assets/images/syntropy-method-pt.png';
import { useMainContext } from '../../hooks/useMainContext';

export interface HeaderProps {
  screenTitle: string;
  showBackButton?: boolean;
  homeScreen?: boolean;
}
export function Header({
  screenTitle,
  showBackButton,
  homeScreen
}: HeaderProps): React.JSX.Element {
  const navigation = useNavigation();
  const { language } = useMainContext();

  return (
    <View className="flex-row items-center justify-between h-14 border-b px-5">
      <View className="w-10">
        {showBackButton && (
          <Icon
            name="chevronLeft"
            size={25}
            color="black"
            onPress={navigation.goBack}
          />
        )}
      </View>
      {homeScreen ? (
        <Image
          source={language === 'pt' ? LogoPt : LogoEn}
          style={{ width: 100, height: 70 }}
          resizeMode="contain"
        />
      ) : (
        <Text className="font-semibold text-black">{screenTitle}</Text>
      )}
      <View className="w-10" />
    </View>
  );
}
