import React, { useRef, useState } from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { BiodiversityDBProps, TreeDBProps } from '../../../../types/database';
import { useTranslation } from 'react-i18next';
import { CoordinateProps } from '../../../../types/regenerator';
import { Portal } from 'react-native-portalize';
import { Modalize } from 'react-native-modalize';
import { Icon } from '../../../../components/Icon/Icon';
import { useSQLite } from '../../../../hooks/useSQLite';

interface Props {
  biodiversity?: BiodiversityDBProps;
  tree?: TreeDBProps;
  updateList: () => void;
  registerType: 'biodiversity' | 'tree';
  hiddenDeleteButton?: boolean;
}
export function RegisterItem({
  biodiversity,
  tree,
  updateList,
  registerType,
  hiddenDeleteButton,
}: Props) {
  const deleteModalRef = useRef<Modalize>(null);
  const { deleteBiodiversity, deleteTree } = useSQLite();
  const { t } = useTranslation();
  const [loadingDelete, setLoadingDelete] = useState(false);
  const coordinate: CoordinateProps = {
    latitude: biodiversity
      ? JSON.parse(biodiversity.coordinate).latitude
      : JSON.parse(tree?.coordinate as string).latitude,
    longitude: biodiversity
      ? JSON.parse(biodiversity.coordinate).longitude
      : JSON.parse(tree?.coordinate as string).longitude,
  };

  function openModalConfirmDelete() {
    deleteModalRef.current?.open();
  }

  function closeModalConfirmDelete() {
    deleteModalRef.current?.close();
  }

  async function handleDelete() {
    setLoadingDelete(true);

    const id = registerType === 'biodiversity' ? biodiversity?.id : tree?.id;

    if (registerType === 'biodiversity') {
      await deleteBiodiversity(id as number);
      updateList();
      closeModalConfirmDelete();
    }

    if (registerType === 'tree') {
      await deleteTree(id as number);
      updateList();
      closeModalConfirmDelete();
    }
    
    setLoadingDelete(false);
  }

  return (
    <View className="w-full rounded-2xl p-3 flex-row bg-gray-200 mb-3 relative">
      <View className="w-20 h-20 border rounded-2xl overflow-hidden ">
        <Image
          source={{ uri: biodiversity ? biodiversity?.photo : tree?.photo }}
          className="w-full h-full"
          resizeMode="cover"
        />
      </View>

      <View className="ml-3">
        <Text className="text-xs">{t('coordinate')}</Text>
        <Text className="text-black text-sm">
          Lat: {coordinate?.latitude}, Lng: {coordinate?.longitude}
        </Text>

        <Text className="text-xs mt-1">{t('specie')}</Text>
        <Text className="text-black text-sm">ID= 0 - indefinido</Text>
      </View>

      {!hiddenDeleteButton && (
        <TouchableOpacity
          className="absolute top-3 right-3"
          onPress={openModalConfirmDelete}
        >
          <Icon name="trash" color="red" />
        </TouchableOpacity>
      )}

      <Portal>
        <Modalize ref={deleteModalRef} adjustToContentHeight>
          <View className="p-5">
            <Text className="font-semibold text-lg text-center text-black">
              {t('atention')}
            </Text>

            <Text className="mt-5 text-black">
              {registerType === 'biodiversity'
                ? t('textConfirmDeleteBio')
                : t('textConfirmDeleteTree')}
            </Text>

            <View className="mt-10">
              <TouchableOpacity
                onPress={handleDelete}
                className="w-full h-10 items-center justify-center rounded-2xl bg-red-500"
                disabled={loadingDelete}
              >
                {loadingDelete ? (
                  <ActivityIndicator size={30} color="white" />
                ) : (
                  <Text className="text-white font-semibold">
                    {registerType === 'biodiversity'
                      ? t('deleteBio')
                      : t('deleteTree')}
                  </Text>
                )}
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
