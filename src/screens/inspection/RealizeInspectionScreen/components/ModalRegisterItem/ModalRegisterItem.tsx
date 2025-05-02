import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { Modalize } from 'react-native-modalize';
import { Portal } from 'react-native-portalize';
import { useTranslation } from 'react-i18next';
import { useLocation } from '../../../../../hooks/useLocation';
import { CameraComponent } from '../../../../../components/Camera/Camera';
import { CoordinateProps } from '../../../../../types/regenerator';

type RegisterType = 'biodiversity' | 'tree';

export interface RegisterItemProps {
  coordinate: CoordinateProps;
  photo: string;
  specieData: string;
  registerType: RegisterType;
}

interface Props {
  registerType: RegisterType;
  count: number;
  registerItem: (data: RegisterItemProps) => void;
}

export function ModalRegisterItem({ count, registerItem, registerType }: Props) {
  const modalRef = useRef<Modalize>(null);
  const { t } = useTranslation();
  const { location } = useLocation();
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [photo, setPhoto] = useState<string>();

  function handleOpenModal() {
    modalRef.current?.open();
  }

  function handleTakePhoto() {
    setShowCamera(true);
  }

  function handleRegisterItem(): void {
    if (!location) {
      Alert.alert('Error', 'Location not available');
      return;
    };
    if (!photo) {
      Alert.alert('Error', 'Take the picture');
      return;
    };

    const mockSpecie = {
      id: 0,
      name: 'indefinido',
    };

    const coordinate: CoordinateProps = {
      latitude: location?.coords?.latitude.toString(),
      longitude: location?.coords?.longitude.toString()
    };

    registerItem({
      coordinate,
      photo,
      registerType,
      specieData: JSON.stringify(mockSpecie)
    });
    setPhoto(undefined);
    modalRef.current?.close();
  }

  return (
    <View className="mb-4">
      <TouchableOpacity
        className="w-[150] h-24 rounded-2xl bg-gray-200 items-center justify-center "
        onPress={handleOpenModal}
      >
        <Text>{registerType === 'biodiversity' ? t('biodiversity') : t('trees')}</Text>
        <Text className="font-bold text-black text-3xl">{count}</Text>
        <Text className="text-xs">{t('touchHereToRegister')}</Text>
      </TouchableOpacity>

      <Portal>
        <Modalize ref={modalRef} adjustToContentHeight>
          <View className="p-3">
            <Text className="text-black text-center">{t('register')}</Text>

            <Text className="mt-10">{t('yourLocation')}</Text>
            <Text className="text-black">
              Lat: {location?.coords?.latitude}, Lng:{' '}
              {location?.coords?.longitude}
            </Text>

            <Text className="mt-5">{t('registerPhoto')}</Text>
            <View className="flex-row items-center mt-1">
              {photo && (
                <Image
                  source={{ uri: photo }}
                  className="w-24 h-24 rounded-2xl mr-5"
                  resizeMode="cover"
                />
              )}
              <TouchableOpacity
                className="w-32 h-12 rounded-2xl items-center justify-center border border-green-600"
                onPress={handleTakePhoto}
              >
                <Text className="text-green-600 font-semibold">{t('takePhoto')}</Text>
              </TouchableOpacity>
            </View>

            <Text className="mt-5">{t('specie')}</Text>
            <Text className="text-black">
              ID= 0 - Indefinido
            </Text>

            <TouchableOpacity
              className="w-full h-12 rounded-2xl items-center justify-center bg-green-600 mt-5"
              onPress={handleRegisterItem}
            >
              <Text className="text-white font-semibold">{t('register')}</Text>
            </TouchableOpacity>
          </View>
        </Modalize>
      </Portal>

      {showCamera && (
        <CameraComponent close={() => setShowCamera(false)} photo={setPhoto} />
      )}
    </View>
  );
}
