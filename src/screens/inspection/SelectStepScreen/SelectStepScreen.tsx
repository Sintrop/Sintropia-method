import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Screen } from '../../../components/Screen/Screen';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { InspectionStackParamsList } from '../../../routes/InspectionRoutes';
import { CameraComponent } from '../../../components/Camera/Camera';
import { useInspectionContext } from '../../../hooks/useInspectionContext';
import { useSQLite } from '../../../hooks/useSQLite';

type ScreenProps = NativeStackScreenProps<
  InspectionStackParamsList,
  'SelectStepScreen'
>;
export function SelectStepScreen({ route, navigation }: ScreenProps) {
  const { collectionMethod } = route.params;
  const { t } = useTranslation();
  const { areaOpened } = useInspectionContext();
  const { updateProofPhoto } = useSQLite();
  const [showCamera, setShowCamera] = useState(false);
  const [proofPhoto, setProofPhoto] = useState('');

  //TODO: Get permission location and disable btn inpsection when not location available
  useEffect(() => {
    getProofPhoto();
  }, [areaOpened]);

  function getProofPhoto() {
    if (!areaOpened) return;
    setProofPhoto(areaOpened?.proofPhoto);
  }

  function handleUpdateProofPhoto(uri: string) {
    if (!areaOpened) return;
    setProofPhoto(uri);
    updateProofPhoto(uri, areaOpened?.id);
  }

  function handleGoToInspection() {
    navigation.navigate('RealizeInspectionScreen', {
      collectionMethod,
    });
  }

  function handleGoToSamplings() {
    if (!areaOpened) return;
    navigation.navigate('SamplingsScreen', {
      areaId: areaOpened?.id
    })
  }

  return (
    <Screen screenTitle={t('selectStep')}>
      <TouchableOpacity
        className="w-full px-5 min-h-10 rounded-2xl border py-3"
        onPress={() => setShowCamera(true)}
      >
        <Text className="font-semibold text-black">{t('proofPhoto')}</Text>

        {proofPhoto !== '' && (
          <Image
            source={{ uri: proofPhoto }}
            className="w-20 h-20 rounded-2xl"
            resizeMode="cover"
          />
        )}
      </TouchableOpacity>

      {collectionMethod === 'manual' && (
        <TouchableOpacity
          className="w-full px-5 min-h-10 rounded-2xl border py-3 mt-5"
          onPress={handleGoToInspection}
        >
          <Text className="font-semibold text-black">{t('inspection')}</Text>
        </TouchableOpacity>
      )}

      {collectionMethod === 'sampling' && (
        <TouchableOpacity
          className="w-full px-5 min-h-10 rounded-2xl border py-3 mt-5"
          onPress={handleGoToSamplings}
        >
          <Text className="font-semibold text-black">{t('samplings')}</Text>
        </TouchableOpacity>
      )}

      {showCamera && (
        <CameraComponent
          close={() => setShowCamera(false)}
          photo={handleUpdateProofPhoto}
        />
      )}
    </Screen>
  );
}
