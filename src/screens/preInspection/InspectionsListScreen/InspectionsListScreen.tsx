import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ListRenderItemInfo,
  View,
} from 'react-native';
import {Screen} from '../../../components/Screen/Screen';
import {useTranslation} from 'react-i18next';
import {getInspectionsList} from '../../../services/inspection/getInspectionsList';
import {InspectionProps} from '../../../types/inspection';
import {InspectionItem} from './components/InspectionItem';
import {PreviewInspection} from '../../../components/PreviewInspection/PreviewInspection';

export function InspectionsListScreen() {
  const {t} = useTranslation();
  const [loading, setLoading] = useState(true);
  const [inspections, setInspections] = useState<InspectionProps[]>([]);
  const [selectedInspection, setSelecetedInspection] = useState(
    {} as InspectionProps,
  );

  useEffect(() => {
    handleGetInspections();
  }, []);

  async function handleGetInspections(): Promise<void> {
    setLoading(true);
    const response = await getInspectionsList({
      rpcUrl: 'https://sequoiarpc.sintrop.com',
      testnet: true,
    });

    if (response.success) {
      setInspections(response.inspections);
    } else {
      Alert.alert('Algo deu errado', response.message);
    }
    setLoading(false);
  }

  function renderInspectionItem({item}: ListRenderItemInfo<InspectionProps>) {
    return (
      <InspectionItem
        inspection={item}
        onChangeInspection={setSelecetedInspection}
      />
    );
  }

  if (loading) {
    return (
      <Screen screenTitle={t('inspectionsList')} showBackButton>
        <View className="h-screen items-center justify-center">
          <ActivityIndicator size={40} color="#1eb76f" />
        </View>
      </Screen>
    );
  }

  return (
    <Screen screenTitle={t('inspectionsList')} showBackButton>
      <FlatList
        data={inspections}
        keyExtractor={item => item.id.toString()}
        renderItem={renderInspectionItem}
      />

      <PreviewInspection inspection={selectedInspection} />
    </Screen>
  );
}
