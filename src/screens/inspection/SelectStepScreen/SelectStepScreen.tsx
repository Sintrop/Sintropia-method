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

type ScreenProps = NativeStackScreenProps<
  InspectionStackParamsList,
  'SelectStepScreen'
>;
export function SelectStepScreen({ route, navigation }: ScreenProps) {
  const { collectionMethod } = route.params;
  const { t } = useTranslation();
  const { areaOpened } = useInspectionContext();
  const { fetchSampligsArea } = useSQLite();
  const { requestLocationPermission } = usePermissions();

  useEffect(() => {
    requestLocationPermission();
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

  function handleGoToInspectorReport(): void {
    navigation.navigate('InspectorReportScreen');
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
        onPress={handleGoToInspectorReport}
      >
        <Text className="font-semibold text-black">
          {t('inspectorReport.title')}
        </Text>
      </TouchableOpacity>

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
