import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SamplingDBProps } from '../../../../../types/database';
import { SamplingItem } from './SamplingItem';

interface Props {
  samplings: SamplingDBProps[];
  collectionMethod: string;
}

export function SamplingList({ collectionMethod, samplings }: Props) {
  const { t } = useTranslation();

  return (
    <View className="mt-5 pt-2">
      <Text className="text-green-500 font-bold text-lg">{t('trees')}</Text>

      {samplings.length === 0 ? (
        <View className="mt-5">
          <Text className="text-center">{t('anyTreeRegistered')}</Text>
        </View>
      ) : (
        <>
          {samplings.map((item, index) => (
            <SamplingItem
              key={index}
              collectionMethod={collectionMethod}
              sampling={item}
              index={index}
            />
          ))}
        </>
      )}
    </View>
  );
}
