import React, {useEffect, useRef, useState} from 'react';
import {View, Text, Alert, ActivityIndicator} from 'react-native';
import {Modalize} from 'react-native-modalize';
import {Portal} from 'react-native-portalize';
import {InspectionProps} from '../../types/inspection';
import {useTranslation} from 'react-i18next';
import {StatusTagInspection} from '../StatusTagInspection/StatusTagInspection';
import {RegeneratorProps} from '../../types/regenerator';
import {getRegeneratorByAddress} from '../../services/regenerator/getRegeneratorByAddress';

interface Props {
  inspection: InspectionProps;
  next: () => void;
}
export function PreviewInspection({next, inspection}: Props) {
  const modalRef = useRef<Modalize>();
  const {t} = useTranslation();
  const [loadingRegenerator, setLoadingRegenerator] = useState(false);
  const [regenerator, setRegenerator] = useState({} as RegeneratorProps);

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
                    {t('totalArea')}: {Intl.NumberFormat('pt-BR').format(regenerator.totalArea)} m²
                  </Text>
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
