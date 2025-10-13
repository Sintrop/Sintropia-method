import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, TouchableOpacity } from 'react-native';
import { Portal } from 'react-native-portalize';
import { Modalize } from 'react-native-modalize';
import { useInspectionContext } from '../../../../../hooks/useInspectionContext';
import { useSafeAreaApp } from '../../../../../hooks/useSafeAreaApp';

interface Props {
  areaId: number;
  disabled: boolean;
}
export function FinishInspection({ areaId, disabled }: Props) {
  const { bottom } = useSafeAreaApp();
  const modalRef = useRef<Modalize>(null);
  const { finishInspection } = useInspectionContext();
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
        className="w-full h-12 rounded-2xl items-center justify-center bg-green-500 mt-10"
        onPress={openModalConfirmDelete}
        style={{ opacity: disabled ? 0.5 : 1 }}
        disabled={disabled}
      >
        <Text className="font-semibold text-white">{t('markAsRealized')}</Text>
      </TouchableOpacity>

      <Portal>
        <Modalize ref={modalRef} adjustToContentHeight>
          <View className="p-5" style={{ paddingBottom: bottom }}>
            <Text className="font-semibold text-lg text-center text-black">
              {t('atention')}
            </Text>

            <Text className="mt-5 text-black">
              {t('textConfirmFinishInspection')}
            </Text>

            <View className="mt-10">
              <TouchableOpacity
                onPress={() => finishInspection(areaId)}
                className="w-full h-10 items-center justify-center rounded-2xl bg-green-500"
              >
                <Text className="text-white font-semibold">
                  {t('finishInspection')}
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
