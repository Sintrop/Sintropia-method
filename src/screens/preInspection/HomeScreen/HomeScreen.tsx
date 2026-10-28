import React, { useCallback, useState } from 'react';
import { Alert, Linking, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../../../components/Screen/Screen';
import { LanguageSelector } from '../../../components/LanguageSelector/LanguageSelector';
import { PreInspectionStackParamsList } from '../../../routes/PreInspectionRoutes';
import { useInspectionContext } from '../../../hooks/useInspectionContext';
import { useMainContext } from '../../../hooks/useMainContext';
import { useSQLite } from '../../../hooks/useSQLite';
import { AreaDBProps } from '../../../types/database';
import { Card } from '../../../components/ui/Card';
import { AppButton } from '../../../components/ui/AppButton';
import { Badge } from '../../../components/ui/Badge';
import { SectionTitle } from '../../../components/ui/SectionTitle';
import { Icon } from '../../../components/Icon/Icon';
import { APP_VERSION } from '../../../constants/app';
import colors from '../../../theme/colors';

type ScreenProps = NativeStackScreenProps<
  PreInspectionStackParamsList,
  'HomeScreen'
>;
export function HomeScreen({ navigation }: ScreenProps): React.JSX.Element {
  const { areaOpened, enterInspectionMode, deleteAreaInspection } =
    useInspectionContext();
  const { t } = useTranslation();
  const { language } = useMainContext();
  const { db, fetchHistoryInspections } = useSQLite();
  const [finished, setFinished] = useState<AreaDBProps[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (db) {
        fetchHistoryInspections().then(list => setFinished(list.reverse()));
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [db]),
  );

  function handleOpenPrivacyPolicy() {
    Linking.openURL(
      `https://regenerationcredit.org/${language.toLowerCase()}/methods/sintropia/privacy-policy`,
    );
  }

  function confirmDeleteOpened() {
    if (!areaOpened) return;
    Alert.alert(t('atention'), t('textConfirmDeleteInspection'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('deleteInspection'),
        style: 'destructive',
        onPress: () => deleteAreaInspection(areaOpened.id),
      },
    ]);
  }

  return (
    <Screen
      screenTitle="Sintropia"
      homeScreen
      right={<LanguageSelector />}
      scrollable
    >
      <Text className="text-3xl font-bold text-ink mt-4 leading-9">
        {t('homeScreen.title')}
      </Text>
      <Text className="text-base text-muted mt-2">
        {t('homeScreen.subtitle')}
      </Text>

      {areaOpened ? (
        <Card style={{ marginTop: 24 }}>
          <Badge label={t('homeScreen.inProgress')} tone="warning" />
          <Text className="text-xl font-bold text-ink mt-3">
            {areaOpened.name}
          </Text>
          <Text className="text-sm text-muted mt-1">
            {Intl.NumberFormat('pt-BR').format(areaOpened.size)} m² ·{' '}
            {areaOpened.collectionMethod === 'manual'
              ? t('manual')
              : t('sampling')}
          </Text>
          <AppButton
            title={t('homeScreen.continueCollection')}
            icon="map"
            onPress={enterInspectionMode}
            className="mt-5"
          />
          <TouchableOpacity
            onPress={confirmDeleteOpened}
            className="items-center mt-3"
          >
            <Text className="text-danger font-semibold">
              {t('deleteInspection')}
            </Text>
          </TouchableOpacity>
        </Card>
      ) : (
        <Card style={{ marginTop: 24 }}>
          <View className="w-12 h-12 rounded-2xl bg-brand-soft items-center justify-center">
            <Icon name="tree" size={26} color={colors.brand} />
          </View>
          <Text className="text-xl font-bold text-ink mt-4">
            {t('homeScreen.newCollection')}
          </Text>
          <Text className="text-sm text-muted mt-1">
            {t('homeScreen.newCollectionHint')}
          </Text>
          <AppButton
            title={t('selectRegenerator')}
            icon="search"
            onPress={() => navigation.navigate('RegeneratorsListScreen')}
            className="mt-5"
          />
        </Card>
      )}

      <SectionTitle
        title={t('homeScreen.finished')}
        style={{ marginTop: 32, marginBottom: 10 }}
      />
      {finished.length === 0 ? (
        <Text className="text-muted">{t('noAreasInspected')}</Text>
      ) : (
        finished.map(area => (
          <TouchableOpacity
            key={area.id}
            onPress={() =>
              navigation.navigate('ReportScreen', {
                collectionMethod: area.collectionMethod,
                area,
              })
            }
            className="flex-row items-center bg-surface border border-line rounded-2xl px-4 py-3.5 mb-2"
          >
            <View className="w-10 h-10 rounded-xl bg-brand-soft items-center justify-center">
              <Icon name="report" size={20} color={colors.brand} />
            </View>
            <View className="flex-1 ml-3">
              <Text className="font-semibold text-ink" numberOfLines={1}>
                {area.name}
              </Text>
              <Text className="text-xs text-muted">
                {Intl.NumberFormat('pt-BR').format(area.size)} m² ·{' '}
                {area.collectionMethod === 'manual'
                  ? t('manual')
                  : t('sampling')}
              </Text>
            </View>
            <Icon name="chevronRight" size={20} color={colors.muted} />
          </TouchableOpacity>
        ))
      )}

      <View className="items-center mt-10">
        <TouchableOpacity onPress={handleOpenPrivacyPolicy}>
          <Text className="text-muted text-sm underline">
            {t('homeScreen.privacyPolicy')}
          </Text>
        </TouchableOpacity>
        <Text className="text-xs text-muted mt-2">
          {t('homeScreen.version', { version: APP_VERSION })}
        </Text>
      </View>
    </Screen>
  );
}
