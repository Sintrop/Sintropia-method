import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Screen } from '../../../components/Screen/Screen';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { InspectionStackParamsList } from '../../../routes/InspectionRoutes';
import { CameraComponent } from '../../../components/Camera/Camera';
import { useInspectionContext } from '../../../hooks/useInspectionContext';
import { useSQLite } from '../../../hooks/useSQLite';
import { HeaderInspectionMode } from '../components/HeaderInspectionMode';
import { FinishInspection } from './components/FinishInspection/FinishInspection';
import { DeleteInspection } from './components/DeleteInspection/DeleteInspection';

type ScreenProps = NativeStackScreenProps<
  InspectionStackParamsList,
  'SelectStepScreen'
>;
export function SelectStepScreen({ route, navigation }: ScreenProps) {
  const { collectionMethod } = route.params;
  const { t } = useTranslation();
  const { areaOpened } = useInspectionContext();
  const { updateProofPhoto, fetchSampligsArea } = useSQLite();
  const [showCamera, setShowCamera] = useState(false);
  const [proofPhoto, setProofPhoto] = useState('');
  const [hasGpsPermission, setHasGpsPermission] = useState<boolean>(false);

  //TODO: Get permission location and disable btn inpsection when not location available]
  useEffect(() => {
    requestLocationPermissions();
  }, []);

  useEffect(() => {
    getProofPhoto();
  }, [areaOpened]);

  async function requestLocationPermissions() {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      const hasPermission = granted === PermissionsAndroid.RESULTS.GRANTED;
      setHasGpsPermission(hasPermission);
      return hasPermission;
    }
  }

  function getProofPhoto() {
    if (!areaOpened) return;
    setProofPhoto(areaOpened?.proofPhoto);
  }

  function handleUpdateProofPhoto(uri: string) {
    if (!areaOpened) return;
    setProofPhoto(uri);
    updateProofPhoto(uri, areaOpened?.id);
  }

  async function handleGoToInspectionManual() {
    if (!areaOpened) return;
    if (collectionMethod !== 'manual') return;

    const response = await fetchSampligsArea(areaOpened.id);

    navigation.navigate('RealizeInspectionScreen', {
      collectionMethod,
      sampling: response[0],
    });
  }

  async function handleGoToCollectBio() {
    if (!areaOpened) return;
    if (collectionMethod !== 'sampling') return;

    const response = await fetchSampligsArea(areaOpened.id);
    if (response.length === 0) {
      Alert.alert(t('atention'), t('createOneSamplingFirst'));
      return;
    }

    navigation.navigate('RealizeInspectionScreen', {
      collectionMethod,
      sampling: response[0],
      collectOnlyBio: true,
    });
  }

  function handleGoToSamplings() {
    if (!areaOpened) return;
    navigation.navigate('SamplingsScreen', {
      areaId: areaOpened?.id,
      areaCoordinates: JSON.parse(areaOpened?.coordinates),
    });
  }

  function handleGoToReport(): void {
    if (!areaOpened) return;
    if (proofPhoto === '') {
      Alert.alert(t('atention', t('youNeedToTakeTheProofPhoto')));
      return;
    }

    navigation.navigate('ReportScreen', {
      collectionMethod,
      area: {
        ...areaOpened,
        proofPhoto,
      },
    });
  }

  if (!hasGpsPermission) {
    return (
      <Screen screenTitle={t('areaInspection')}>
        <View className="items-center justify-center">
          <HeaderInspectionMode />

          <Text className="text-black text-center mt-10 font-semibold">
            {t('weNeedYourGPSPermission')}
          </Text>
          <Text className="text-black text-center mt-1">
            {t('descWeNeedYourGPSPermission')}
          </Text>

          <TouchableOpacity
            className="mt-10 w-fit px-10 h-10 rounded-2xl bg-blue-500 items-center justify-center"
            onPress={requestLocationPermissions}
          >
            <Text className="text-white font-semibold">
              {t('givePermission')}
            </Text>
          </TouchableOpacity>

          <Text className="text-gray-500 text-xs text-center mt-5">
            {t('helpGivePermission')}
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen screenTitle={t('areaInspection')} scrollable>
      <View className="mt-5" />

      <HeaderInspectionMode />

      <TouchableOpacity
        className="w-full px-5 min-h-10 rounded-2xl border py-3 mt-5"
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
          onPress={handleGoToInspectionManual}
        >
          <Text className="font-semibold text-black">{t('inspection')}</Text>
        </TouchableOpacity>
      )}

      {collectionMethod === 'sampling' && (
        <>
          <TouchableOpacity
            className="w-full px-5 min-h-10 rounded-2xl border py-3 mt-5"
            onPress={handleGoToSamplings}
          >
            <Text className="font-semibold text-black">
              {t('treesSampling')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-full px-5 min-h-10 rounded-2xl border py-3 mt-5"
            onPress={handleGoToCollectBio}
          >
            <Text className="font-semibold text-black">
              {t('biodiversity')}
            </Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity
        className="w-full px-5 min-h-10 rounded-2xl border py-3 mt-5"
        onPress={handleGoToReport}
      >
        <Text className="font-semibold text-black">{t('report')}</Text>
      </TouchableOpacity>

      <FinishInspection
        areaId={areaOpened?.id as number}
        disabled={proofPhoto === ''}
      />

      <DeleteInspection areaId={areaOpened?.id as number} />

      {showCamera && (
        <CameraComponent
          close={() => setShowCamera(false)}
          photo={handleUpdateProofPhoto}
        />
      )}
    </Screen>
  );
}
