import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, IconName } from '../../../../components/Icon/Icon';
import colors from '../../../../theme/colors';

export type CollectionTab = 'map' | 'photos' | 'summary';

const tabs: { key: CollectionTab; icon: IconName; label: string }[] = [
  { key: 'map', icon: 'map', label: 'collection.tabs.map' },
  { key: 'photos', icon: 'camera', label: 'collection.tabs.photos' },
  { key: 'summary', icon: 'report', label: 'collection.tabs.summary' },
];

interface Props {
  current: CollectionTab;
  onChange: (tab: CollectionTab) => void;
  bottomInset: number;
  pendingPhotos: boolean;
}

export function TabBar({
  current,
  onChange,
  bottomInset,
  pendingPhotos,
}: Props) {
  const { t } = useTranslation();

  return (
    <View
      className="flex-row bg-surface border-t border-line"
      style={{ paddingBottom: bottomInset }}
    >
      {tabs.map(tab => {
        const active = tab.key === current;
        const color = active ? colors.brand : colors.muted;
        return (
          <TouchableOpacity
            key={tab.key}
            className="flex-1 items-center pt-2.5 pb-1"
            onPress={() => onChange(tab.key)}
          >
            <View>
              <Icon name={tab.icon} color={color} size={22} />
              {tab.key === 'photos' && pendingPhotos && (
                <View className="absolute -top-0.5 -right-1.5 w-2.5 h-2.5 rounded-full bg-danger" />
              )}
            </View>
            <Text className="text-xs mt-1 font-semibold" style={{ color }}>
              {t(tab.label)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
