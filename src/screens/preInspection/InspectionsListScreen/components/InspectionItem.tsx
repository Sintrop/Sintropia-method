import React from 'react';
import {TouchableOpacity, View, Text} from 'react-native';
import {InspectionProps} from '../../../../types/inspection';
import {useTranslation} from 'react-i18next';
import {StatusTagInspection} from '../../../../components/StatusTagInspection/StatusTagInspection';

interface Props {
  inspection: InspectionProps;
  onChangeInspection: (inspection: InspectionProps) => void;
}
export function InspectionItem({inspection, onChangeInspection}: Props) {
  const {t} = useTranslation();

  return (
    <TouchableOpacity
      className="w-full border-b px-2 py-2"
      onPress={() => onChangeInspection(inspection)}
    >
      <View className="flex-row items-center justify-between">
        <Text className="font-semibold text-black">
          {t('inspection')} #{inspection.id}
        </Text>
        <StatusTagInspection status={inspection.status} />
      </View>

      <Text className="mt-2">{t('regenerator')}</Text>
      <Text className="text-black">{inspection.regenerator}</Text>
    </TouchableOpacity>
  );
}
