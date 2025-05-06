import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { Icon } from '../../../../../components/Icon/Icon';

interface Props {
  close: () => void;
  areaId: number;
}

export function ModalCreateSampling({ close, areaId }: Props) {
  const { t } = useTranslation();

  return (
    <Modal visible onRequestClose={close} animationType="slide" transparent>
      <View className="flex-1 bg-white">
        <View className="flex-row items-center justify-between h-14 border-b px-5">
          <View className="w-10" />
          <Text className="font-semibold text-black">
            {t('createSampling')}
          </Text>
          <View className="w-10">
            <Icon name="close" size={25} color="black" onPress={close} />
          </View>
        </View>
      </View>
    </Modal>
  );
}
