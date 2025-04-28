import React, {useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Screen} from '../../../components/Screen/Screen';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {PreInspectionStackParamsList} from '../../../routes/PreInspectionRoutes';
import {getInspectionById} from '../../../services/inspection/getInspectionById';
import {InspectionProps} from '../../../types/inspection';

type ScreenProps = NativeStackScreenProps<
  PreInspectionStackParamsList,
  'SearchInspectionScreen'
>;
export function SearchInspectionScreen({navigation}: ScreenProps) {
  const {t} = useTranslation();
  const [id, setId] = useState('');
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [inspection, setInspection] = useState({} as InspectionProps);

  function handleGoToInspectionsList() {
    navigation.navigate('InspectionsListScreen');
  }

  async function handleSearchInspection() {
    if (!id.trim()) return;
    setLoadingSearch(true);
    const response = await getInspectionById({
      id: parseInt(id),
      rpcUrl: 'https://sequoiarpc.sintrop.com',
      testnet: true,
    });

    if (response.success) {
      if (response.inspection) setInspection(response.inspection);
    } else {
      Alert.alert('Error', response.message)
    }
    setLoadingSearch(false);
  }

  return (
    <Screen screenTitle={t('searchInspection')} showBackButton>
      <Text>{t('searchInspectionByID')}</Text>
      <View className="flex-row mt-1">
        <TextInput
          value={id}
          onChangeText={setId}
          placeholder={t('typeIDHere')}
          placeholderTextColor="#aaa"
          className="flex-1 h-[48] rounded-2xl border px-5"
          keyboardType="numeric"
        />

        <TouchableOpacity
          className="w-20 h-[48] bg-[#229B13] flex items-center justify-center rounded-2xl ml-5"
          onPress={handleSearchInspection}
          disabled={loadingSearch}>
          {loadingSearch ? (
            <ActivityIndicator color="white" size={30} />
          ) : (
            <Text className="font-semibold text-white">{t('search')}</Text>
          )}
        </TouchableOpacity>
      </View>

      <Text className="mt-10">{t('or')}</Text>

      <TouchableOpacity
        className="px-10 h-[48] border border-[#229B13] flex items-center justify-center rounded-2xl"
        onPress={handleGoToInspectionsList}>
        <Text className="font-semibold text-[#229B13]">
          {t('accessListOfInspections')}
        </Text>
      </TouchableOpacity>
    </Screen>
  );
}
