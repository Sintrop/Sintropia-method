import React from 'react';
import {Text} from 'react-native';
import {Screen} from '../../../components/Screen/Screen';
import {useTranslation} from 'react-i18next';

export function InspectionsListScreen() {
  const {t} = useTranslation();

  return (
    <Screen screenTitle={t('inspectionsList')} showBackButton>
      <Text>Inspections list</Text>
    </Screen>
  );
}
