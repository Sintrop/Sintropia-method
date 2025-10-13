import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { ProofPhotosDBProps } from '../../../../../types/database';
import { Portal } from 'react-native-portalize';
import { Modalize } from 'react-native-modalize';
import { Icon } from '../../../../../components/Icon/Icon';
import { useTranslation } from 'react-i18next';
import { useSQLite } from '../../../../../hooks/useSQLite';
import { useSafeAreaApp } from '../../../../../hooks/useSafeAreaApp';

interface Props {
  photo: ProofPhotosDBProps;
  proofPhotoDeleted: () => void;
}

export function ProofPhotoItem({ photo, proofPhotoDeleted }: Props) {
  const { bottom } = useSafeAreaApp();
  const { t } = useTranslation();
  const { deleteProofPhoto } = useSQLite();
  const modalRef = useRef<Modalize>(null);

  function openModalConfirmDelete() {
    modalRef.current?.open();
  }

  function closeModalConfirmDelete() {
    modalRef.current?.close();
  }

  async function handleDeletePhoto() {
    await deleteProofPhoto(photo.id);
    proofPhotoDeleted();
    closeModalConfirmDelete();
  }

  return (
    <View>
      <View key={photo.id} className="relative">
        <TouchableOpacity
          className="absolute top-1 right-4 z-10"
          onPress={openModalConfirmDelete}
        >
          <Icon name="trash" color="red" />
        </TouchableOpacity>
        <Image
          source={{ uri: photo.photo }}
          className="w-20 h-20 rounded-2xl mr-3"
          resizeMode="cover"
        />
      </View>

      <Portal>
        <Modalize ref={modalRef} adjustToContentHeight>
          <View className="p-5" style={{ paddingBottom: bottom }}>
            <Text className="font-semibold text-lg text-center text-black">
              {t('atention')}
            </Text>

            <Text className="mt-5 text-black">
              {t('selectStepScreen.textConfirmDeletePhoto')}
            </Text>

            <View className="mt-10">
              <TouchableOpacity
                onPress={handleDeletePhoto}
                className="w-full h-10 items-center justify-center rounded-2xl bg-red-500"
              >
                <Text className="text-white font-semibold">
                  {t('selectStepScreen.deletePhoto')}
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
