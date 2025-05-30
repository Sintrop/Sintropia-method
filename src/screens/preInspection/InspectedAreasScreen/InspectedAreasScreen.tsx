import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, ListRenderItemInfo, Text, View } from 'react-native';
import { Screen } from '../../../components/Screen/Screen';
import { useTranslation } from 'react-i18next';
import { useSQLite } from '../../../hooks/useSQLite';
import { AreaDBProps } from '../../../types/database';
import { InspectedAreaItem } from './components/InspectedAreaItem/InspectedAreaItem';

export function InspectedAreasScreen() {
  const { t } = useTranslation();
  const { fetchHistoryInspections, db } = useSQLite();
  const [inspectedAreas, setInspectedAreas] = useState<AreaDBProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (db) {
      getAreas();
    }
  }, [db]);

  async function getAreas() {
    setLoading(true);
    const response = await fetchHistoryInspections();
    setInspectedAreas(response);
    setLoading(false);
  }

  function EmptyList() {
    return (
      <View className="mt-10 items-center">
        <Text className="text-gray-500">{t('noAreasInspected')}</Text>
      </View>
    )
  }

  function renderAreaItem({ item }: ListRenderItemInfo<AreaDBProps>) {
    return <InspectedAreaItem area={item} />
  }

  if (loading) {
    return (
      <Screen screenTitle={t('inspectedAreas')} showBackButton>
        <View className="absolute flex-1 w-screen h-screen items-center justify-center">
          <ActivityIndicator size={40} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen screenTitle={t('inspectedAreas')} showBackButton>
      <FlatList
        data={inspectedAreas}
        keyExtractor={item => item.id.toString()}
        renderItem={renderAreaItem}
        ListEmptyComponent={EmptyList}
      />
    </Screen>
  );
}
