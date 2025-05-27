import React, { useEffect, useState, useRef } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { SamplingDBProps } from '../../../../../types/database';
import { useTranslation } from 'react-i18next';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { InspectionStackParamsList } from '../../../../../routes/InspectionRoutes';
import { useNavigation } from '@react-navigation/native';
import { useSQLite } from '../../../../../hooks/useSQLite';
import { Portal } from 'react-native-portalize';
import { Modalize } from 'react-native-modalize';
import { Icon } from '../../../../../components/Icon/Icon';

interface Props {
  sampling: SamplingDBProps;
  updateList: () => void;
  index: number;
}

type NavigationProps = NativeStackNavigationProp<InspectionStackParamsList>;
export function SamplingListItem({ sampling, updateList, index }: Props) {
  const modalDeleteRef = useRef<Modalize>(null);
  const { t } = useTranslation();
  const { db, fetchTreesSampling, deleteSampling } = useSQLite();
  const navigation = useNavigation<NavigationProps>();
  const [treesCount, setTreesCount] = useState<number>(0);
  const [loadingDelete, setLoadingDelete] = useState(false);

  useEffect(() => {
    if (db) {
      getTrees();
    }
  }, [db]);

  async function getTrees() {
    const response = await fetchTreesSampling(sampling.id);
    setTreesCount(response.length);
  }

  function handleGoToInspection() {
    navigation.navigate('RealizeInspectionScreen', {
      collectionMethod: 'sampling',
      sampling: {
        ...sampling,
        number: index + 1
      },
    });
  }

  function openModalConfirmDelete() {
    modalDeleteRef.current?.open();
  }

  function closeModalConfirmDelete() {
    modalDeleteRef.current?.close();
  }

  async function handleDelete() {
    setLoadingDelete(true);
    await deleteSampling(sampling.id);
    updateList();
    closeModalConfirmDelete();
    setLoadingDelete(false);
  }

  return (
    <TouchableOpacity
      className="w-full rounded-2xl bg-gray-200 p-3 mb-5"
      onPress={handleGoToInspection}
    >
      <Text className="font-bold text-black">
        {t('sampling')} #{index + 1}
      </Text>

      <View className="flex-row mt-3">
        <View className="w-20 h-20 rounded-2xl bg-gray-300"></View>

        <View className="w-20 h-20 rounded-2xl bg-gray-300 ml-5 items-center justify-center">
          <Text className="font-bold text-2xl text-black">{treesCount}</Text>
          <Text className="text-sm">{t('trees')}</Text>
        </View>
      </View>

      <Text className="text-xs mt-2 text-center">
        {t('touchToEnterThisSampling')}
      </Text>

      <TouchableOpacity
        className="absolute top-3 right-3"
        onPress={openModalConfirmDelete}
      >
        <Icon name="trash" color="red" />
      </TouchableOpacity>
      <Portal>
        <Modalize ref={modalDeleteRef} adjustToContentHeight>
          <View className="p-5">
            <Text className="font-semibold text-lg text-center text-black">
              {t('atention')}
            </Text>

            <Text className="mt-5 text-black">
              {t('textConfirmDeleteSampling')}
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
                    {t('deleteSampling')}
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
    </TouchableOpacity>
  );
}
