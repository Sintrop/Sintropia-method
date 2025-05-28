/* eslint-disable react-native/no-inline-styles */
import React, {useRef} from 'react';
import {Text, View, TouchableOpacity} from 'react-native';
import {useTranslation} from 'react-i18next';
import i18next from 'i18next';
import {Modalize} from 'react-native-modalize';
import {Portal} from 'react-native-portalize';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function LanguageSelector(): React.JSX.Element {
  const modalRef = useRef<Modalize>(null);
  const {t} = useTranslation();

  function openModal(): void {
    modalRef.current?.open();
  }

  function closeModal(): void {
    modalRef.current?.close();
  }

  function handleSelectLanguage(language: string): void {
    i18next.changeLanguage(language);
    AsyncStorage.setItem('language', language);
    closeModal();
  }

  return (
    <View className="">
      <TouchableOpacity
        onPress={openModal}
        className="flex-row items-center p-1 rounded-full w-16 border h-8">
        <View className="w-5 h-5 rounded-full bg-gray-400" />
        <Text className="text-black uppercase ml-2">{i18next.language}</Text>
      </TouchableOpacity>

      <Portal>
        <Modalize
          ref={modalRef}
          adjustToContentHeight
          childrenStyle={{height: 300}}>
          <View className="flex-1 p-5">
            <Text className="text-center font-semibold text-gray-500">
              {t('selectYourLanguage')}
            </Text>

            <View className="mt-10">
              <LanguageItemSelect
                label="English"
                onSelect={handleSelectLanguage}
                value="en"
              />

              <LanguageItemSelect
                label="Português"
                onSelect={handleSelectLanguage}
                value="pt"
              />
            </View>
          </View>
        </Modalize>
      </Portal>
    </View>
  );
}

interface LanguageItemSelectProps {
  value: string;
  label: string;
  onSelect: (language: string) => void;
}

function LanguageItemSelect({
  label,
  onSelect,
  value,
}: LanguageItemSelectProps): React.JSX.Element {
  return (
    <TouchableOpacity
      className="flex-row items-center h-12 border-b mt-3"
      onPress={() => onSelect(value)}>
      <View className="w-5 h-5 rounded-xl bg-green-500" />
      <Text className="text-black ml-3">{label}</Text>
    </TouchableOpacity>
  );
}
