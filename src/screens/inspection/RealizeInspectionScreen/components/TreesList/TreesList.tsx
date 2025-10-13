import React, { useRef } from 'react';
import { View, Text, ListRenderItemInfo } from 'react-native';
import { TreeDBProps } from '../../../../../types/database';
import { RegisterItem } from '../RegisterItem';
import { Portal } from 'react-native-portalize';
import { Modalize } from 'react-native-modalize';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import { useSafeAreaApp } from '../../../../../hooks/useSafeAreaApp';

interface Props {
  list: TreeDBProps[];
  updateList: () => void;
}

export function TreesList({ list, updateList }: Props) {
  const { bottom } = useSafeAreaApp();
  const { t } = useTranslation();
  const modalRef = useRef<Modalize>();

  function renderTreeItem({ item }: ListRenderItemInfo<TreeDBProps>) {
    return (
      <RegisterItem tree={item} updateList={updateList} registerType="tree" />
    );
  }

  function EmptyList() {
    return (
      <View className="p-5">
        <Text className="text-center text-gray-500">
          {t('noTreeRegistered')}
        </Text>
      </View>
    );
  }

  function HeaderList() {
    return <Text className="text-center mb-3 text-gray-500">{t('trees')}</Text>;
  }

  function handleOpenModal(): void {
    modalRef.current?.open();
  }

  return (
    <View className="mr-5">
      <TouchableOpacity
        className="w-[150] h-20 rounded-2xl bg-gray-200 items-center justify-center"
        onPress={handleOpenModal}
      >
        <Text className="text-gray-500">{t('trees')}</Text>
        <Text className="font-bold text-black text-3xl">{list.length}</Text>
      </TouchableOpacity>

      <Portal>
        <Modalize
          ref={modalRef}
          adjustToContentHeight
          flatListProps={{
            data: list,
            keyExtractor: (item, index) => index.toString(),
            renderItem: renderTreeItem,
            showsVerticalScrollIndicator: false,
            ListEmptyComponent: EmptyList,
            ListHeaderComponent: HeaderList,
            contentContainerStyle: {
              padding: 10,
              paddingTop: 20,
              paddingBottom: bottom,
            },
          }}
        />
      </Portal>
    </View>
  );
}
