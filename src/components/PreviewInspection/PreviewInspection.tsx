import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import {Modalize} from 'react-native-modalize';
import {Portal} from 'react-native-portalize';
import {InspectionProps} from '../../types/inspection';
import {useTranslation} from 'react-i18next';
import {StatusTagInspection} from '../StatusTagInspection/StatusTagInspection';
import {CoordinateProps, RegeneratorProps} from '../../types/regenerator';
import {getRegeneratorByAddress} from '../../services/regenerator/getRegeneratorByAddress';
import {getCoordinates} from '../../services/regenerator/getCoordinates';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {PreInspectionStackParamsList} from '../../routes/PreInspectionRoutes';

type NavigationProps = NativeStackNavigationProp<
  PreInspectionStackParamsList,
  'SearchInspectionScreen'
>;
interface Props {
  inspection: InspectionProps;
}
export function PreviewInspection({inspection}: Props) {
  const navigation = useNavigation<NavigationProps>();
  const modalRef = useRef<Modalize>();
  const {t} = useTranslation();
  const [loadingRegenerator, setLoadingRegenerator] = useState(false);
  const [regenerator, setRegenerator] = useState({} as RegeneratorProps);
  const [loadingCoordinates, setLoadingCoordinates] = useState(false);

  useEffect(() => {
    if (inspection.regenerator) {
      modalRef.current?.open();
      handleGetRegeneratorData();
    }
  }, [inspection]);

  async function handleGetRegeneratorData() {
    setLoadingRegenerator(true);
    const response = await getRegeneratorByAddress({
      address: inspection?.regenerator,
      rpcUrl: 'https://sequoiarpc.sintrop.com',
      testnet: true,
    });

    if (response.success) {
      if (response.regenerator) setRegenerator(response.regenerator);
    } else {
      Alert.alert('Error', response.message);
    }
    setLoadingRegenerator(false);
  }

  async function handleGetCoordinates() {
    setLoadingCoordinates(true);
    const response = await getCoordinates({
      address: inspection.regenerator,
      coordinatesCount: regenerator?.coordinatesCount,
      rpcUrl: 'https://sequoiarpc.sintrop.com',
      testnet: true,
    });

    if (response.success) {
      goToAreaPreview(response.coords);
    } else {
      Alert.alert('Error', response.messsage);
    }
    setLoadingCoordinates(false);
  }

  function goToAreaPreview(coords: CoordinateProps[]): void {
    navigation.navigate('AreaPreviewScreen', {
      inspection,
      regenerator,
      coords,
      areaSize: regenerator?.totalArea
    });
    modalRef.current?.close();
  }

  return (
    <Portal>
      <Modalize ref={modalRef} adjustToContentHeight>
        <View className="flex-1 p-5">
          <Text className="font-semibold text-black text-center">
            {t('inspection')} #{inspection.id}
          </Text>

          <View className="flex-row items-center mt-5">
            <Text className="text-black mr-3">{t('status')}:</Text>

            <StatusTagInspection status={inspection.status} />
          </View>
          <Text className="text-black mt-1">
            {t('requestedAt')}: {inspection.createdAt}
          </Text>
          <Text className="text-black mt-1">
            {t('regeneratorWallet')}: {inspection.regenerator}
          </Text>

          {loadingRegenerator ? (
            <ActivityIndicator size={30} />
          ) : (
            <>
              {regenerator?.name ? (
                <View>
                  <Text className="text-black mt-1">
                    {t('name')}: {regenerator.name}
                  </Text>
                  <Text className="text-black mt-1">
                    {t('totalArea')}:{' '}
                    {Intl.NumberFormat('pt-BR').format(regenerator.totalArea)}{' '}
                    m²
                  </Text>

                  <TouchableOpacity
                    className="w-full h-[48] rounded-2xl bg-[#229B13] flex items-center justify-center mt-5"
                    onPress={handleGetCoordinates}
                    disabled={loadingCoordinates}>
                    {loadingCoordinates ? (
                      <ActivityIndicator color="white" size={30} />
                    ) : (
                      <Text className="font-semibold text-white">
                        {t('continue')}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <Text>Error on get data</Text>
              )}
            </>
          )}
        </View>
      </Modalize>
    </Portal>
  );
}
