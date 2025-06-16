import React from 'react';
import { View, Text } from 'react-native';
import { BiodiversityDBProps } from '../../../../../types/database';
import { useTranslation } from 'react-i18next';
import { RegisterItem } from '../../../RealizeInspectionScreen/components/RegisterItem';

interface Props {
  list: BiodiversityDBProps[];
}
export function BiodiversityList({ list }: Props) {
  const { t } = useTranslation();

  return (
    <View className="mt-8 pt-2">
      <Text className="text-green-500 font-bold text-lg">
        {t('biodiversity')}
      </Text>
      {list.length === 0 ? (
        <View className="mt-5">
          <Text className="text-center text-gray-500">{t('anyBiodiversityRegistered')}</Text>
        </View>
      ) : (
        <>
          {list.map((item, index) => (
            <RegisterItem
              key={index}
              biodiversity={item}
              registerType="biodiversity"
              hiddenDeleteButton
              updateList={() => {}}
            />
          ))}
        </>
      )}
    </View>
  );
}
