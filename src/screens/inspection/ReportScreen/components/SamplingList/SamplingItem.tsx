import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { SamplingDBProps, TreeDBProps } from '../../../../../types/database';
import { useTranslation } from 'react-i18next';
import { useSQLite } from '../../../../../hooks/useSQLite';
import { RegisterItem } from '../../../RealizeInspectionScreen/components/RegisterItem';
import { calculateAreaCircle } from '../../../../../services/inspection/calculateAreaCircle';

interface Props {
  sampling: SamplingDBProps;
  collectionMethod: string;
  index: number;
}
export function SamplingItem({ collectionMethod, sampling, index }: Props) {
  const { t } = useTranslation();
  const { fetchTreesSampling, db } = useSQLite();
  const [trees, setTrees] = useState<TreeDBProps[]>([]);

  useEffect(() => {
    if (db) {
      getTrees();
    }
  }, [db]);

  async function getTrees() {
    const response = await fetchTreesSampling(sampling.id);
    setTrees(response);
  }

  return (
    <View>
      {trees.length === 0 ? (
        <View className="mt-5">
          <Text className="text-center">{t('anyTreeRegistered')}</Text>
        </View>
      ) : (
        <>
          {collectionMethod === 'sampling' && (
            <View className="mt-3 mb-2">
              <Text className="text-black font-semibold">
                {t('sampling')} #{index + 1}
              </Text>
              <View className="mt-1 flex-row">
                <View className="w-24 h-16 rounded-2xl bg-gray-200 items-center justify-center">
                  <Text className="font-bold text-black text-xl">
                    {trees.length}
                  </Text>
                  <Text>{t('trees')}</Text>
                </View>

                <View className="w-24 h-16 rounded-2xl bg-gray-200 items-center justify-center ml-5">
                  <Text className="font-bold text-black text-xl">
                    {sampling.size} m
                  </Text>
                  <Text>{t('radius')}</Text>
                </View>

                <View className="w-24 h-16 rounded-2xl bg-gray-200 items-center justify-center ml-5">
                  <Text className="font-bold text-black">
                    {calculateAreaCircle(sampling.size)} m²
                  </Text>
                  <Text>{t('area')}</Text>
                </View>
              </View>
            </View>
          )}
          {trees.map((item, index) => (
            <RegisterItem
              key={index}
              tree={item}
              registerType="tree"
              hiddenDeleteButton
              updateList={() => {}}
            />
          ))}
        </>
      )}
    </View>
  );
}
