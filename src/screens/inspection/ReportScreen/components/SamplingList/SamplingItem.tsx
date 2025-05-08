import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { SamplingDBProps, TreeDBProps } from '../../../../../types/database';
import { useTranslation } from 'react-i18next';
import { useSQLite } from '../../../../../hooks/useSQLite';
import { RegisterItem } from '../../../RealizeInspectionScreen/components/RegisterItem';

interface Props {
  sampling: SamplingDBProps;
  collectionMethod: string;
}
export function SamplingItem({ collectionMethod, sampling }: Props) {
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
            <View className="mt-3 mb-2 items-center">
              <Text className="text-center text-black font-semibold">
                {t('sampling')} #{sampling.number} - {sampling.size} m² (
                {trees.length}) {t('trees')}
              </Text>
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
