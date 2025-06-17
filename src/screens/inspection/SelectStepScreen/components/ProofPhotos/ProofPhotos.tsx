import React, { useEffect, useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useInspectionContext } from '../../../../../hooks/useInspectionContext';
import { useSQLite } from '../../../../../hooks/useSQLite';
import { useTranslation } from 'react-i18next';
import { CameraComponent } from '../../../../../components/Camera/Camera';
import { ProofPhotosDBProps } from '../../../../../types/database';
import { ProofPhotoItem } from './ProofPhotoItem';


export function ProofPhotos() {
  const { t } = useTranslation();
  const { areaOpened } = useInspectionContext();
  const { updateProofPhoto, fetchProofPhotosArea, addProofPhoto, db, initDB, deleteProofPhoto } =
    useSQLite();
  const [showCamera, setShowCamera] = useState(false);
  const [proofPhoto, setProofPhoto] = useState('');
  const [proofPhotos, setProofPhotos] = useState<ProofPhotosDBProps[]>([]);
  const [registerType, setRegisterType] = useState<
    'proof-photo' | 'proof-photos'
  >('proof-photo');

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
    setProofPhoto(areaOpened?.proofPhoto);
  }

  async function getProofPhotos() {
    if (!areaOpened) return;
    const response = await fetchProofPhotosArea(areaOpened.id);
    setProofPhotos(response);
  }

  function handleTakeProofPhoto() {
    setRegisterType('proof-photo');
    setShowCamera(true);
  }

  function handleTakeProofPhotos() {
    setRegisterType('proof-photos');
    setShowCamera(true);
  }

  async function photoTaked(uri: string) {
    if (registerType === 'proof-photo') {
      if (!areaOpened) return;
      setProofPhoto(uri);
      await updateProofPhoto(uri, areaOpened?.id);
    }

    if (registerType === 'proof-photos') {
      if (!areaOpened) return;
      await addProofPhoto({
        areaId: areaOpened.id,
        photo: uri,
      });
      const response = await fetchProofPhotosArea(areaOpened.id);
      setProofPhotos(response);
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
          {proofPhoto === '' ? (
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
            {proofPhotos.length}/10
          </Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {proofPhotos.map((item, index) => (
            <ProofPhotoItem photo={item} proofPhotoDeleted={getProofPhotos} key={index} />
          ))}

          {proofPhotos.length < 10 && (
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
    </View>
  );
}
