import React, { useRef } from 'react';
import { View, Text, ListRenderItemInfo } from 'react-native';
import { TreeDBProps } from '../../../../../types/database';
import { RegisterItem } from '../RegisterItem';
import { Portal } from 'react-native-portalize';
import { Modalize } from 'react-native-modalize';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';

interface Props {
  list: TreeDBProps[];
  updateList: () => void;
}

export function TreesList({ list, updateList }: Props) {
  const { t } = useTranslation();
  const modalRef = useRef<Modalize>();

  function renderTreeItem({ item }: ListRenderItemInfo<TreeDBProps>) {
    return (
      <RegisterItem
        biodiversity={item}
        updateList={updateList}
        registerType="tree"
      />
    );
  }

  function EmptyList() {
    return (
      <View className="mb-3">
        <Text>not list</Text>
      </View>
    );
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
        <Text>{t('trees')}</Text>
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
            contentContainerStyle: { padding: 10 },
          }}
        />
      </Portal>
    </View>
  );
}
