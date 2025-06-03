import React from 'react';
import {TouchableOpacity, View, Text, Alert} from 'react-native';
import {InspectionProps} from '../../../../types/inspection';
import {useTranslation} from 'react-i18next';
import {StatusTagInspection} from '../../../../components/StatusTagInspection/StatusTagInspection';

interface Props {
  inspection: InspectionProps;
  onChangeInspection: (inspection: InspectionProps) => void;
}
export function InspectionItem({inspection, onChangeInspection}: Props) {
  const {t} = useTranslation();

  function handleChangeInspection() {
    if (inspection.status === 0 || inspection.status === 1) {
      onChangeInspection(inspection)
    } else {
      Alert.alert(
        t('atention'),
        t('youCanOnlyInspectInspectionOpenedAndAccepted')
      )
    }
  }

  return (
    <TouchableOpacity
      className="w-full border-b px-2 py-2"
      onPress={handleChangeInspection}
    >
      <View className="flex-row items-center justify-between">
        <Text className="font-semibold text-black">
          {t('inspection')} #{inspection.id}
        </Text>
        <StatusTagInspection status={inspection.status} />
      </View>

      <Text className="mt-2 text-gray-500">{t('regenerator')}</Text>
      <Text className="text-black">{inspection.regenerator}</Text>
    </TouchableOpacity>
  );
}
