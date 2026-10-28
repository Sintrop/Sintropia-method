import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Screen } from '../../../components/Screen/Screen';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { InspectionStackParamsList } from '../../../routes/InspectionRoutes';
import {
  BiodiversityDBProps,
  SamplingDBProps,
  TreeDBProps,
} from '../../../types/database';
import { useSQLite } from '../../../hooks/useSQLite';
import { ModalCreateSampling } from './components/ModalCreateSampling/ModalCreateSampling';
import { SamplingListItem } from './components/SamplingListItem/SamplingListItem';
import { RadiusSamplingSelector } from './components/RadiusSamplingSelector/RadiusSamplingSelector';
import { SamplingsMap } from './components/SamplingsMap/SamplingsMap';

type ScreenProps = NativeStackScreenProps<
  InspectionStackParamsList,
  'SamplingsScreen'
>;
export function SamplingsScreen({ route, navigation }: ScreenProps) {
  const { areaId, areaCoordinates } = route.params;
  const { t } = useTranslation();
  const {
    db,
    fetchSampligsArea,
    fetchTreesByAreaId,
    fetchBiodiversityByAreaId,
  } = useSQLite();
  const [samplings, setSamplings] = useState<SamplingDBProps[]>([]);
  const [trees, setTrees] = useState<TreeDBProps[]>([]);
  const [biodiversity, setBiodiversity] = useState<BiodiversityDBProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateSampling, setShowCreateSampling] = useState(false);
  const [radiusSampling, setRadiusSampling] = useState(5);

  useFocusEffect(
    useCallback(() => {
      if (db) {
        handleGetSamplings();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [db]),
  );

  async function handleGetSamplings() {
    const response = await fetchSampligsArea(areaId);
    setSamplings(response);
    setTrees(await fetchTreesByAreaId(areaId));
    setBiodiversity(await fetchBiodiversityByAreaId(areaId));

    if (response.length > 0) {
      setRadiusSampling(response[0].size);
    }
    setLoading(false);
  }

  function handleEnterSampling(samplingId: number) {
    const index = samplings.findIndex(item => item.id === samplingId);
    if (index === -1) return;

    navigation.navigate('RealizeInspectionScreen', {
      collectionMethod: 'sampling',
      sampling: { ...samplings[index], number: index + 1 },
    });
  }

  function handleShowCreateSampling() {
    setShowCreateSampling(true);
  }

  if (loading) {
    return (
      <Screen screenTitle={t('samplings')} showBackButton>
        <View className="absolute w-screen h-screen items-center justify-center">
          <ActivityIndicator size={40} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen screenTitle={t('samplings')} showBackButton scrollable>
      <SamplingsMap
        areaCoordinates={areaCoordinates}
        samplings={samplings}
        trees={trees}
        biodiversity={biodiversity}
        onPressSampling={handleEnterSampling}
      />

      {samplings.length === 0 ? (
        <View className="mt-10">
          <RadiusSamplingSelector
            sizeSelected={radiusSampling}
            onChange={setRadiusSampling}
          />

          <Text className="text-black text-center">
            {t('thereAreNotAnySamplingCreated')}
          </Text>

          <ButtonCreateSampling onPress={handleShowCreateSampling} />
        </View>
      ) : (
        <View className="pt-5">
          {samplings.map((sampling, index) => (
            <SamplingListItem
              key={sampling.id}
              sampling={sampling}
              treesCount={
                trees.filter(tree => tree.samplingId === sampling.id).length
              }
              updateList={handleGetSamplings}
              index={index}
            />
          ))}

          <ButtonCreateSampling onPress={handleShowCreateSampling} />
        </View>
      )}

      {showCreateSampling && (
        <ModalCreateSampling
          close={() => setShowCreateSampling(false)}
          areaId={areaId}
          areaCoordinates={areaCoordinates}
          samplingsCount={samplings.length}
          samplingCreated={handleGetSamplings}
          existingSamplings={samplings}
          samplingSize={radiusSampling}
        />
      )}
    </Screen>
  );
}

interface ButtonCreateSamplingProps {
  onPress: () => void;
}
function ButtonCreateSampling({ onPress }: ButtonCreateSamplingProps) {
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      className="w-full h-10 rounded-2xl bg-green-500 items-center justify-center mt-10"
      onPress={onPress}
    >
      <Text className="font-semibold text-white">{t('createNewSampling')}</Text>
    </TouchableOpacity>
  );
}
