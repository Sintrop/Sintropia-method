import React, { useEffect, useState, useRef } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Portal } from 'react-native-portalize';
import { Modalize } from 'react-native-modalize';
import { launchImageLibrary } from 'react-native-image-picker';
import { useInspectionContext } from '../../../../../hooks/useInspectionContext';
import { useSQLite } from '../../../../../hooks/useSQLite';
import { useTranslation } from 'react-i18next';
import { CameraComponent } from '../../../../../components/Camera/Camera';
import { ProofPhotosDBProps } from '../../../../../types/database';
import { ProofPhotoItem } from './ProofPhotoItem';
import { useSafeAreaApp } from '../../../../../hooks/useSafeAreaApp';

export const MIN_AREA_PHOTOS = 3;
export const MAX_AREA_PHOTOS = 10;

export interface ProofPhotosStatus {
  hasRegeneratorPhoto: boolean;
  areaPhotosCount: number;
}

interface Props {
  onChange?: (status: ProofPhotosStatus) => void;
}

export function ProofPhotos({ onChange }: Props) {
  const { bottom } = useSafeAreaApp();
  const modalChoosePhoto = useRef<Modalize>(null);
  const { t } = useTranslation();
  const { areaOpened, fetchOpenedAreas } = useInspectionContext();
  const { updateProofPhoto, fetchProofPhotosArea, addProofPhoto, db, initDB } =
    useSQLite();
  const [showCamera, setShowCamera] = useState(false);
  const [proofPhoto, setProofPhoto] = useState('');
  const [proofPhotos, setProofPhotos] = useState<ProofPhotosDBProps[]>([]);
  const [registerType, setRegisterType] = useState<
    'proof-photo' | 'proof-photos'
  >('proof-photo');

  useEffect(() => {
    onChange?.({
      hasRegeneratorPhoto: proofPhoto !== '' && proofPhoto !== null,
      areaPhotosCount: proofPhotos.length,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proofPhoto, proofPhotos]);

  useEffect(() => {
    getProofPhoto();
    if (db) {
      getProofPhotos();
    } else {
      initDB();
    }
  }, [areaOpened, db]);

  function getProofPhoto() {
    if (!areaOpened) return;
    setProofPhoto(areaOpened?.proofPhoto ?? '');
  }

  async function getProofPhotos() {
    if (!areaOpened) return;
    const response = await fetchProofPhotosArea(areaOpened.id);
    setProofPhotos(response);
  }

  function handleTakeProofPhoto() {
    setRegisterType('proof-photo');
    modalChoosePhoto.current?.open();
  }

  function handleTakeProofPhotos() {
    setRegisterType('proof-photos');
    modalChoosePhoto.current?.open();
  }

  async function handlePickImage(): Promise<void> {
    const result = await launchImageLibrary({ mediaType: 'photo' });
    if (result.assets) {
      photoTaked(result.assets[0].uri as string);
    }
  }

  async function photoTaked(uri: string) {
    if (registerType === 'proof-photo') {
      if (!areaOpened) return;
      setProofPhoto(uri);
      await updateProofPhoto(uri, areaOpened?.id);
      modalChoosePhoto.current?.close();
      fetchOpenedAreas();
    }

    if (registerType === 'proof-photos') {
      if (!areaOpened) return;
      await addProofPhoto({
        areaId: areaOpened.id,
        photo: uri,
      });
      const response = await fetchProofPhotosArea(areaOpened.id);
      setProofPhotos(response);
      modalChoosePhoto.current?.close();
    }
  }

  return (
    <View>
      <View className="w-full px-5 min-h-10 rounded-2xl border py-3 mt-5">
        <Text className="font-semibold text-black">
          {t('selectStepScreen.proofPhotos')}
        </Text>
        <Text className="text-gray-500 text-xs">
          {t('selectStepScreen.registerPhotoWithRegenerator')}
        </Text>
        <TouchableOpacity onPress={handleTakeProofPhoto} className="w-20 h-20">
          {!proofPhoto ? (
            <View className="w-20 h-20 rounded-2xl items-center justify-center bg-gray-300">
              <Text className="text-black text-center text-xs">
                {t('selectStepScreen.touchToRegister')}
              </Text>
            </View>
          ) : (
            <Image
              source={{ uri: proofPhoto }}
              className="w-20 h-20 rounded-2xl"
              resizeMode="cover"
            />
          )}
        </TouchableOpacity>

        <View className="flex-row items-center justify-between">
          <Text className="text-gray-500 text-xs mt-2">
            {t('selectStepScreen.registerMorePhotosOfArea')}
          </Text>

          <Text className="text-gray-500 text-xs mt-2">
            {t('selectStepScreen.areaPhotosCount', {
              count: proofPhotos.length,
              min: MIN_AREA_PHOTOS,
              max: MAX_AREA_PHOTOS,
            })}
          </Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {proofPhotos.map((item, index) => (
            <ProofPhotoItem
              photo={item}
              proofPhotoDeleted={getProofPhotos}
              key={index}
            />
          ))}

          {proofPhotos.length < MAX_AREA_PHOTOS && (
            <TouchableOpacity
              onPress={handleTakeProofPhotos}
              className="w-20 h-20 rounded-2xl items-center justify-center bg-gray-300"
            >
              <Text className="text-black text-center text-xs">
                {t('selectStepScreen.touchToRegister')}
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      {showCamera && (
        <CameraComponent
          close={() => setShowCamera(false)}
          photo={photoTaked}
        />
      )}

      <Portal>
        <Modalize
          ref={modalChoosePhoto}
          adjustToContentHeight
          modalStyle={{ backgroundColor: 'transparent' }}
        >
          <View
            className="p-5 bg-white rounded-t-3xl"
            style={{ paddingBottom: bottom }}
          >
            <Text className="font-semibold text-lg text-center text-black">
              {t('selectStepScreen.selectPhotoSource')}
            </Text>

            <Text className="mt-5 text-black">
              {t('selectStepScreen.textConfirmSelectPhotoSource')}
            </Text>

            <View className="mt-10 mb-5 flex-row items-center justify-center">
              <TouchableOpacity
                onPress={handlePickImage}
                className="w-20 h-20 items-center justify-center rounded-2xl bg-gray-300"
              >
                <Text className="text-black font-semibold">
                  {t('selectStepScreen.gallery')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowCamera(true)}
                className="w-20 h-20 items-center justify-center rounded-2xl bg-gray-300 ml-10"
              >
                <Text className="text-black font-semibold">
                  {t('selectStepScreen.camera')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modalize>
      </Portal>
    </View>
  );
}
