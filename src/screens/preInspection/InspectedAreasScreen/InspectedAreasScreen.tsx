import React, { useEffect } from 'react';
import {Text} from 'react-native';
import {Screen} from '../../../components/Screen/Screen';
import {useTranslation} from 'react-i18next';
import { useSQLite } from '../../../hooks/useSQLite';

export function InspectedAreasScreen() {
  const {t} = useTranslation();
  const {fetchAreas} = useSQLite()

  useEffect(() => {
    handleGetInspectedAreas()
  }, [])

  async function handleGetInspectedAreas() {
    const response = await fetchAreas()
    console.log(response)
  }

  return (
    <Screen screenTitle={t('inspectedAreas')} showBackButton>
      <Text>Inspected</Text>
    </Screen>
  );
}
