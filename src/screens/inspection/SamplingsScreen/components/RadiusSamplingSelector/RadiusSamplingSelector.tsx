import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, TouchableOpacity } from 'react-native';

interface Props {
  sizeSelected: number;
  onChange: (size: number) => void;
}

export function RadiusSamplingSelector({ onChange, sizeSelected }: Props) {
  const { t } = useTranslation();

  return (
    <View className="items-center mb-10">
      <Text className="text-center">
        {t('selectTheSizeOfRadiusOfSampling')}
      </Text>

      <View className="mt-1 flex-row">
        <SizeItem
          value={5}
          isSelected={sizeSelected === 5}
          onChange={onChange}
        />

        <SizeItem
          value={10}
          isSelected={sizeSelected === 10}
          onChange={onChange}
        />

        <SizeItem
          value={15}
          isSelected={sizeSelected === 15}
          onChange={onChange}
        />

        <SizeItem
          value={20}
          isSelected={sizeSelected === 20}
          onChange={onChange}
        />
      </View>
    </View>
  );
}

interface SizeItemProps {
  isSelected: boolean;
  value: number;
  onChange: (value: number) => void;
}
function SizeItem({ isSelected, onChange, value }: SizeItemProps) {
  return (
    <TouchableOpacity
      onPress={() => onChange(value)}
      className={`w-12 h-10 border-b-2 mr-2 items-center justify-center ${
        isSelected ? 'border-b-green-500' : 'border-transparent'
      }`}
    >
      <Text
        className={`font-bold ${isSelected ? 'text-green-500' : 'text-black'}`}
      >
        {value} m
      </Text>
    </TouchableOpacity>
  );
}
