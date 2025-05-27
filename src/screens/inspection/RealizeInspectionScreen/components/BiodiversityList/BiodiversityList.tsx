import React, { useRef } from 'react';
import { View, Text, ListRenderItemInfo } from 'react-native';
import { BiodiversityDBProps } from '../../../../../types/database';
import { RegisterItem } from '../RegisterItem';
import { Portal } from 'react-native-portalize';
import { Modalize } from 'react-native-modalize';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';

interface Props {
  list: BiodiversityDBProps[];
  updateList: () => void;
}

export function BiodiversityList({ list, updateList }: Props) {
  const { t } = useTranslation();
  const modalRef = useRef<Modalize>();

  function renderBiodiversityItem({
    item,
  }: ListRenderItemInfo<BiodiversityDBProps>) {
    return (
      <RegisterItem
        biodiversity={item}
        updateList={updateList}
        registerType="biodiversity"
      />
    );
  }

  function EmptyList() {
    return (
      <View className="p-5">
        <Text className="text-center">
          {t('noBiodiversityRegistered')}
        </Text>
      </View>
    );
  }

  function HeaderList() {
    return (
      <Text className="text-center mb-3">{t('biodiversity')}</Text>
    )
  }

  function handleOpenModal(): void {
    modalRef.current?.open();
  }

  return (
    <View>
      <TouchableOpacity
        className="w-[150] h-20 rounded-2xl bg-gray-200 items-center justify-center "
        onPress={handleOpenModal}
      >
        <Text>{t('biodiversity')}</Text>
        <Text className="font-bold text-black text-3xl">{list.length}</Text>
      </TouchableOpacity>

      <Portal>
        <Modalize
          ref={modalRef}
          adjustToContentHeight
          flatListProps={{
            data: list,
            keyExtractor: (item, index) => index.toString(),
            renderItem: renderBiodiversityItem,
            showsVerticalScrollIndicator: false,
            ListEmptyComponent: EmptyList,
            ListHeaderComponent: HeaderList,
            contentContainerStyle: { padding: 10, paddingTop: 20 },
          }}
        />
      </Portal>
    </View>
  );
}
