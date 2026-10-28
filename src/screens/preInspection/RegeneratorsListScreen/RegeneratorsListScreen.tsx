import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ListRenderItemInfo,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../../components/Screen/Screen';
import { PreInspectionStackParamsList } from '../../../routes/PreInspectionRoutes';
import { RegeneratorProps } from '../../../types/regenerator';
import { getRegenerators } from '../../../services/regenerator/getRegenerators';
import { getCoordinates } from '../../../services/regenerator/getCoordinates';
import { RegeneratorItem } from './components/RegeneratorItem';

function normalize(value: string) {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

type ScreenProps = NativeStackScreenProps<
  PreInspectionStackParamsList,
  'RegeneratorsListScreen'
>;
export function RegeneratorsListScreen({ navigation }: ScreenProps) {
  const { t } = useTranslation();
  const [regenerators, setRegenerators] = useState<RegeneratorProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [openingAddress, setOpeningAddress] = useState<string>();

  useEffect(() => {
    loadRegenerators();
  }, []);

  async function loadRegenerators() {
    setLoading(true);
    setError(false);
    try {
      const response = await getRegenerators();
      response.sort((a, b) => {
        if (a.pendingInspection !== b.pendingInspection) {
          return a.pendingInspection ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
      setRegenerators(response);
    } catch (e) {
      console.warn(e);
      setError(true);
    }
    setLoading(false);
  }

  const filtered = useMemo(() => {
    const query = normalize(search.trim());
    if (!query) return regenerators;

    return regenerators.filter(
      regenerator =>
        normalize(regenerator.name).includes(query) ||
        regenerator.regeneratorWallet.toLowerCase().includes(query) ||
        String(regenerator.id) === query.replace('#', ''),
    );
  }, [regenerators, search]);

  async function handleSelect(regenerator: RegeneratorProps) {
    if (openingAddress) return;
    setOpeningAddress(regenerator.regeneratorWallet);
    try {
      const coords = await getCoordinates(regenerator.regeneratorWallet);
      navigation.navigate('AreaPreviewScreen', { regenerator, coords });
    } catch (e) {
      console.warn(e);
      Alert.alert(t('atention'), t('regeneratorsList.errorLoadingArea'));
    }
    setOpeningAddress(undefined);
  }

  function renderItem({ item }: ListRenderItemInfo<RegeneratorProps>) {
    return (
      <RegeneratorItem
        regenerator={item}
        onPress={() => handleSelect(item)}
        loading={openingAddress === item.regeneratorWallet}
      />
    );
  }

  return (
    <Screen screenTitle={t('regeneratorsList.title')} showBackButton>
      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder={t('regeneratorsList.searchPlaceholder')}
        placeholderTextColor="#aaa"
        className="h-[48] rounded-2xl border px-5 text-black"
        autoCorrect={false}
        autoCapitalize="none"
      />

      {loading ? (
        <View className="mt-20 items-center">
          <ActivityIndicator size={40} color="#229B13" />
          <Text className="text-gray-500 mt-3">
            {t('regeneratorsList.loading')}
          </Text>
        </View>
      ) : error ? (
        <View className="mt-20 items-center">
          <Text className="text-black text-center">
            {t('regeneratorsList.errorLoading')}
          </Text>
          <TouchableOpacity
            className="px-10 h-[48] mt-5 border border-[#229B13] items-center justify-center rounded-2xl"
            onPress={loadRegenerators}
          >
            <Text className="font-semibold text-[#229B13]">
              {t('regeneratorsList.tryAgain')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.regeneratorWallet}
          renderItem={renderItem}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 160 }}
          ListEmptyComponent={
            <Text className="text-gray-500 text-center mt-10">
              {t('regeneratorsList.empty')}
            </Text>
          }
        />
      )}
    </Screen>
  );
}
