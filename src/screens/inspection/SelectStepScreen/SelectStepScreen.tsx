import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Screen } from '../../../components/Screen/Screen';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { InspectionStackParamsList } from '../../../routes/InspectionRoutes';
import { useInspectionContext } from '../../../hooks/useInspectionContext';
import { useSQLite } from '../../../hooks/useSQLite';
import { HeaderInspectionMode } from '../components/HeaderInspectionMode';
import { FinishInspection } from './components/FinishInspection/FinishInspection';
import { DeleteInspection } from './components/DeleteInspection/DeleteInspection';
import { usePermissions } from '../../../hooks/usePermissions';
import { ProofPhotos } from './components/ProofPhotos/ProofPhotos';
import { useResetNavigation } from '../../../hooks/useResetNavigation';

type ScreenProps = NativeStackScreenProps<
  InspectionStackParamsList,
  'SelectStepScreen'
>;
export function SelectStepScreen({ route, navigation }: ScreenProps) {
  const { collectionMethod } = route.params;
  const { t } = useTranslation();
  const { areaOpened } = useInspectionContext();
  const { fetchSampligsArea } = useSQLite();
  const { resetToTutorialScreen } = useResetNavigation();
  const { checkLocationPermission, locationStatus, requestLocationPermission } =
    usePermissions();

  useEffect(() => {
    checkLocationPermission();
  }, []);

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

    navigation.navigate('ReportScreen', {
      collectionMethod,
      area: areaOpened,
    });
  }

  if (locationStatus !== 'granted') {
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
            onPress={requestLocationPermission}
          >
            <Text className="text-white font-semibold">{t('continue')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="mt-3 w-fit px-10 h-10 rounded-2xl items-center justify-center"
            onPress={resetToTutorialScreen}
          >
            <Text className="text-black font-semibold">{t('back')}</Text>
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

      <ProofPhotos />

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

      <FinishInspection areaId={areaOpened?.id as number} disabled={false} />

      <DeleteInspection areaId={areaOpened?.id as number} />
    </Screen>
  );
}
