import React, { useRef } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import { Modalize } from 'react-native-modalize';
import { Portal } from 'react-native-portalize';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaApp } from '../../hooks/useSafeAreaApp';
import { Icon } from '../Icon/Icon';
import colors from '../../theme/colors';

const languages = [
  { value: 'pt', label: 'Português' },
  { value: 'en', label: 'English' },
];

export function LanguageSelector(): React.JSX.Element {
  const { bottom } = useSafeAreaApp();
  const modalRef = useRef<Modalize>(null);
  const { t } = useTranslation();

  function handleSelectLanguage(language: string): void {
    i18next.changeLanguage(language);
    AsyncStorage.setItem('language', language);
    modalRef.current?.close();
  }

  return (
    <View>
      <TouchableOpacity
        onPress={() => modalRef.current?.open()}
        className="flex-row items-center h-9 px-3 rounded-full bg-surface border border-line"
      >
        <Icon name="globe" size={16} color={colors.muted} />
        <Text className="text-ink font-semibold uppercase ml-1.5">
          {i18next.language}
        </Text>
      </TouchableOpacity>

      <Portal>
        <Modalize
          ref={modalRef}
          adjustToContentHeight
          modalStyle={{ borderTopLeftRadius: 28, borderTopRightRadius: 28 }}
        >
          <View className="p-5" style={{ paddingBottom: bottom + 8 }}>
            <Text className="text-lg font-bold text-ink">
              {t('selectYourLanguage')}
            </Text>
            <View className="mt-3">
              {languages.map(language => {
                const selected = i18next.language === language.value;
                return (
                  <TouchableOpacity
                    key={language.value}
                    className="flex-row items-center justify-between h-14 border-b border-line"
                    onPress={() => handleSelectLanguage(language.value)}
                  >
                    <Text className="text-ink text-base">{language.label}</Text>
                    {selected && (
                      <Icon name="check" size={20} color={colors.brand} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </Modalize>
      </Portal>
    </View>
  );
}
