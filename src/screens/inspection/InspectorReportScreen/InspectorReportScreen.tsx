import { useEffect, useState } from 'react';
import { Text, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Screen } from '../../../components/Screen/Screen';
import { useInspectionContext } from '../../../hooks/useInspectionContext';
import { useSQLite } from '../../../hooks/useSQLite';

export function InspectorReportScreen() {
  const { t } = useTranslation();
  const { areaOpened, fetchOpenedAreas } = useInspectionContext();
  const { updateInspectorReport } = useSQLite();
  const [input, setInput] = useState('');

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (input) {
        if (areaOpened) {
          await updateInspectorReport(input, areaOpened?.id);
          fetchOpenedAreas();
        }
      }
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [input, updateInspectorReport, areaOpened]);

  useEffect(() => {
    if (areaOpened) {
      setInput(areaOpened?.inspectorReport);
    }
  }, []);

  return (
    <Screen screenTitle={t('inspectorReport.title')} showBackButton>
      <Text className="text-gray-500">{t('inspectorReport.description')}</Text>
      <TextInput
        value={input}
        onChangeText={setInput}
        placeholderTextColor="#aaa"
        placeholder={t('common.typeHere')}
        className="w-full min-h-12 rounded-2xl bg-gray-200 px-3 text-black mt-1 max-h-[200]"
        multiline={true}
      />
    </Screen>
  );
}
