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
  addNewBio?: boolean;
}

interface Props {
  registerType: RegisterType;
  registerItem: (data: RegisterItemProps) => void;
  disabled?: boolean;
}

export function ModalRegisterItem({ registerItem, registerType, disabled }: Props) {
  const modalRef = useRef<Modalize>(null);
  const { t } = useTranslation();
  const { location } = useLocation();
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [photo, setPhoto] = useState<string>();
  const [addNewBio, setAddNewBio] = useState(false);

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
      specieData: JSON.stringify(mockSpecie),
      addNewBio,
    });
    setPhoto(undefined);
    setAddNewBio(false);
    modalRef.current?.close();
  }

  function toggleAddNewBio() {
    setAddNewBio((value) => !value);
  }

  return (
    <View className="mb-4">
      <TouchableOpacity
        className="w-[150] h-10 rounded-2xl bg-gray-200 items-center justify-center "
        onPress={handleOpenModal}
        style={{ opacity: disabled ? 0.8 : 1 }}
        disabled={disabled}
      >
        <Text className="text-xs text-black">
          {registerType === 'tree' ? t('registerNewTree') : t('registerNewBio')}
        </Text>
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

            {registerType === 'tree' && (
              <View className="my-5 flex-row items-center">
                <TouchableOpacity
                  onPress={toggleAddNewBio}
                  className={`w-5 h-5 rounded-md border-2 items-center justify-center ${addNewBio ? 'bg-green-500 border-green-500' : 'bg-transparent'}`}
                >

                </TouchableOpacity>

                <Text className="text-sm text-black ml-3">{t('addNewBiodiversity')}</Text>
              </View>
            )}

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
