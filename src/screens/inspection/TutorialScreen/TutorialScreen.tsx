import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { InspectionStackParamsList } from '../../../routes/InspectionRoutes';
import { Icon, IconName } from '../../../components/Icon/Icon';
import { AppButton } from '../../../components/ui/AppButton';
import { useSafeAreaApp } from '../../../hooks/useSafeAreaApp';
import colors from '../../../theme/colors';

export const TUTORIAL_SEEN_KEY = 'tutorial-seen';

const steps: { icon: IconName; color: string; title: string; text: string }[] =
  [
    {
      icon: 'map',
      color: colors.brand,
      title: 'overview',
      text: 'overviewDescription',
    },
    {
      icon: 'tree',
      color: colors.tree,
      title: 'treesResult',
      text: 'tutorialScreen.trees',
    },
    {
      icon: 'leaf',
      color: colors.bio,
      title: 'biodiversityResult',
      text: 'tutorialScreen.species',
    },
    {
      icon: 'camera',
      color: colors.sampling,
      title: 'selectStepScreen.proofPhotos',
      text: 'tutorialScreen.photos',
    },
    {
      icon: 'report',
      color: colors.brand,
      title: 'report',
      text: 'reportDescription',
    },
  ];

type ScreenProps = NativeStackScreenProps<
  InspectionStackParamsList,
  'TutorialScreen'
>;
export function TutorialScreen({ navigation }: ScreenProps) {
  const { t } = useTranslation();
  const { top, bottom } = useSafeAreaApp();
  const [index, setIndex] = useState(0);
  const step = steps[index];
  const isLast = index === steps.length - 1;

  async function finish() {
    try {
      await AsyncStorage.setItem(TUTORIAL_SEEN_KEY, 'true');
    } catch {}
    navigation.goBack();
  }

  return (
    <View
      className="flex-1 bg-canvas px-6"
      style={{ paddingTop: top + 8, paddingBottom: bottom + 8 }}
    >
      <View className="flex-row justify-between items-center h-12">
        <Text className="text-muted font-semibold">
          {index + 1}/{steps.length}
        </Text>
        <TouchableOpacity onPress={finish} hitSlop={10}>
          <Text className="text-brand font-semibold">
            {t('tutorialScreen.skip')}
          </Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1 items-center justify-center">
        <View
          className="w-28 h-28 rounded-full items-center justify-center"
          style={{ backgroundColor: step.color }}
        >
          <Icon name={step.icon} size={52} color="#FFFFFF" strokeWidth={1.6} />
        </View>
        <Text className="text-2xl font-bold text-ink text-center mt-8">
          {t(step.title)}
        </Text>
        <Text className="text-base text-muted text-center mt-4 leading-6">
          {t(step.text)}
        </Text>
      </View>

      <View className="flex-row justify-center mb-6">
        {steps.map((_, dot) => (
          <View
            key={dot}
            className={`h-2 rounded-full mx-1 ${
              dot === index ? 'w-6 bg-brand' : 'w-2 bg-line'
            }`}
          />
        ))}
      </View>

      <View className="flex-row">
        {index > 0 && (
          <AppButton
            title={t('previous')}
            variant="secondary"
            onPress={() => setIndex(value => value - 1)}
            style={{ flex: 1, marginRight: 12 }}
          />
        )}
        <AppButton
          title={isLast ? t('start') : t('next')}
          onPress={isLast ? finish : () => setIndex(value => value + 1)}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
}
