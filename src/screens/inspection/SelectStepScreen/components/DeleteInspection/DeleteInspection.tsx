import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, TouchableOpacity } from 'react-native';
import { Portal } from 'react-native-portalize';
import { Modalize } from 'react-native-modalize';
import { useInspectionContext } from '../../../../../hooks/useInspectionContext';
import { Icon } from '../../../../../components/Icon/Icon';
import { useSafeAreaApp } from '../../../../../hooks/useSafeAreaApp';

interface Props {
  areaId: number;
}
export function DeleteInspection({ areaId }: Props) {
  const { bottom } = useSafeAreaApp();
  const modalRef = useRef<Modalize>(null);
  const { deleteAreaInspection } = useInspectionContext();
  const { t } = useTranslation();

  function openModalConfirmDelete() {
    modalRef.current?.open();
  }

  function closeModalConfirmDelete() {
    modalRef.current?.close();
  }

  return (
    <View>
      <TouchableOpacity
        className="w-full h-12 rounded-2xl flex-row items-center justify-center bg-red-500 mt-5"
        onPress={openModalConfirmDelete}
      >
        <Icon name="trash" color="white" size={25} />
        <Text className="font-semibold text-white ml-2">
          {t('deleteInspection')}
        </Text>
      </TouchableOpacity>

      <Portal>
        <Modalize ref={modalRef} adjustToContentHeight>
          <View className="p-5" style={{ paddingBottom: bottom }}>
            <Text className="font-semibold text-lg text-center text-black">
              {t('atention')}
            </Text>

            <Text className="mt-5 text-black">
              {t('textConfirmDeleteInspection')}
            </Text>

            <View className="mt-10">
              <TouchableOpacity
                onPress={() => deleteAreaInspection(areaId)}
                className="w-full h-10 items-center justify-center rounded-2xl bg-red-500"
              >
                <Text className="text-white font-semibold">
                  {t('deleteInspection')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={closeModalConfirmDelete}
                className="w-full h-10 items-center justify-center mt-3"
              >
                <Text className="text-black font-semibold">{t('cancel')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modalize>
      </Portal>
    </View>
  );
}
