import React, { useRef } from "react";
import { View, Text, ListRenderItemInfo } from "react-native";
import { BiodiversityDBProps } from "../../../../../types/database";
import { RegisterItem } from "../RegisterItem";
import { Portal } from "react-native-portalize";
import { Modalize } from "react-native-modalize";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useTranslation } from "react-i18next";

interface Props {
  list: BiodiversityDBProps[]
}

export function BiodiversityList({ list }: Props) {
  const {t} = useTranslation();
  const modalRef = useRef<Modalize>();

  function renderBiodiversityItem({ item }: ListRenderItemInfo<BiodiversityDBProps>) {
    return (
      <RegisterItem biodiversity={item} />
    );
  }

  function EmptyList() {
    return <View className="mb-3">
      <Text>not list</Text>
    </View>
  }

  function handleOpenModal(): void {
    modalRef.current?.open();
  }

  return (
    <View>
      <TouchableOpacity
        className="w-[150px] h-10 rounded-2xl bg-gray-200 flex-row items-center justify-center"
        onPress={handleOpenModal}
      >
        <Text className="font-bold text-black">{t('biodiversityList')}</Text>
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
            contentContainerStyle: {padding: 10}
          }}
        />
      </Portal>
    </View>
  )
}
