import React, { useRef, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Modalize } from 'react-native-modalize';
import { Portal } from 'react-native-portalize';
import { launchImageLibrary } from 'react-native-image-picker';
import { CameraComponent } from '../../../../components/Camera/Camera';
import { Icon } from '../../../../components/Icon/Icon';
import { AppButton } from '../../../../components/ui/AppButton';
import { Badge } from '../../../../components/ui/Badge';
import { Card } from '../../../../components/ui/Card';
import { useSafeAreaApp } from '../../../../hooks/useSafeAreaApp';
import { ProofPhotosDBProps } from '../../../../types/database';
import colors from '../../../../theme/colors';

export const MIN_AREA_PHOTOS = 3;
export const MAX_AREA_PHOTOS = 10;

type Target = 'regenerator' | 'area';

interface Props {
  regeneratorPhoto?: string;
  areaPhotos: ProofPhotosDBProps[];
  topInset: number;
  onSetRegeneratorPhoto: (uri: string) => Promise<void>;
  onAddAreaPhoto: (uri: string) => Promise<void>;
  onDeleteAreaPhoto: (id: number) => Promise<void>;
}

export function PhotosPane({
  regeneratorPhoto,
  areaPhotos,
  topInset,
  onSetRegeneratorPhoto,
  onAddAreaPhoto,
  onDeleteAreaPhoto,
}: Props) {
  const { t } = useTranslation();
  const { bottom } = useSafeAreaApp();
  const { width } = useWindowDimensions();
  const sourceRef = useRef<Modalize>(null);
  const [target, setTarget] = useState<Target>('area');
  const [showCamera, setShowCamera] = useState(false);

  // Three columns with two gaps of 8, measured from the grid's real width.
  const [gridWidth, setGridWidth] = useState(width - 80);
  const tile = Math.floor((gridWidth - 16) / 3);
  const hasRegeneratorPhoto = !!regeneratorPhoto;
  const areaDone = areaPhotos.length >= MIN_AREA_PHOTOS;

  function chooseSource(next: Target) {
    setTarget(next);
    sourceRef.current?.open();
  }

  async function savePhoto(uri: string) {
    if (target === 'regenerator') {
      await onSetRegeneratorPhoto(uri);
    } else {
      await onAddAreaPhoto(uri);
    }
  }

  async function pickFromLibrary() {
    sourceRef.current?.close();
    const result = await launchImageLibrary({ mediaType: 'photo' });
    const uri = result.assets?.[0]?.uri;
    if (uri) await savePhoto(uri);
  }

  function openCamera() {
    sourceRef.current?.close();
    setShowCamera(true);
  }

  function confirmDelete(photo: ProofPhotosDBProps) {
    Alert.alert(t('atention'), t('selectStepScreen.textConfirmDeletePhoto'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('selectStepScreen.deletePhoto'),
        style: 'destructive',
        onPress: () => onDeleteAreaPhoto(photo.id),
      },
    ]);
  }

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: topInset }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: 16,
          paddingHorizontal: 20,
          paddingBottom: 24,
        }}
      >
        <Text className="text-2xl font-bold text-ink">
          {t('collection.photos.title')}
        </Text>
        <Text className="text-sm text-muted mt-1">
          {t('collection.photos.subtitle')}
        </Text>

        <Card style={{ marginTop: 20 }}>
          <View className="flex-row items-center justify-between">
            <Text className="font-bold text-ink text-base">
              {t('collection.photos.withRegenerator')}
            </Text>
            <Badge
              label={
                hasRegeneratorPhoto
                  ? t('collection.done')
                  : t('collection.required')
              }
              tone={hasRegeneratorPhoto ? 'brand' : 'warning'}
            />
          </View>
          <Text className="text-sm text-muted mt-1">
            {t('collection.photos.withRegeneratorHint')}
          </Text>

          <TouchableOpacity
            onPress={() => chooseSource('regenerator')}
            className="mt-4 rounded-2xl overflow-hidden bg-canvas border border-dashed border-line items-center justify-center"
            style={{ height: 180 }}
          >
            {hasRegeneratorPhoto ? (
              <Image
                source={{ uri: regeneratorPhoto }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            ) : (
              <>
                <Icon name="camera" size={28} color={colors.muted} />
                <Text className="text-muted mt-2 font-semibold">
                  {t('selectStepScreen.touchToRegister')}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </Card>

        <Card style={{ marginTop: 16 }}>
          <View className="flex-row items-center justify-between">
            <Text className="font-bold text-ink text-base">
              {t('collection.photos.ofArea')}
            </Text>
            <Badge
              label={`${areaPhotos.length}/${MIN_AREA_PHOTOS}`}
              tone={areaDone ? 'brand' : 'warning'}
            />
          </View>
          <Text className="text-sm text-muted mt-1">
            {t('collection.photos.ofAreaHint', {
              min: MIN_AREA_PHOTOS,
              max: MAX_AREA_PHOTOS,
            })}
          </Text>

          <View
            className="flex-row flex-wrap mt-4"
            style={{ gap: 8 }}
            onLayout={event => setGridWidth(event.nativeEvent.layout.width)}
          >
            {areaPhotos.map(photo => (
              <TouchableOpacity
                key={photo.id}
                onLongPress={() => confirmDelete(photo)}
                onPress={() => confirmDelete(photo)}
              >
                <Image
                  source={{ uri: photo.photo }}
                  style={{ width: tile, height: tile, borderRadius: 16 }}
                />
                <View className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/50 items-center justify-center">
                  <Icon name="trash" size={14} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            ))}
            {areaPhotos.length < MAX_AREA_PHOTOS && (
              <TouchableOpacity
                onPress={() => chooseSource('area')}
                className="rounded-2xl bg-canvas border border-dashed border-line items-center justify-center"
                style={{ width: tile, height: tile }}
              >
                <Icon name="plus" size={24} color={colors.muted} />
              </TouchableOpacity>
            )}
          </View>
        </Card>
      </ScrollView>

      {showCamera && (
        <CameraComponent close={() => setShowCamera(false)} photo={savePhoto} />
      )}

      <Portal>
        <Modalize
          ref={sourceRef}
          adjustToContentHeight
          modalStyle={{ borderTopLeftRadius: 28, borderTopRightRadius: 28 }}
        >
          <View className="p-5" style={{ paddingBottom: bottom + 8 }}>
            <Text className="text-lg font-bold text-ink">
              {t('selectStepScreen.selectPhotoSource')}
            </Text>
            <AppButton
              title={t('selectStepScreen.camera')}
              icon="camera"
              onPress={openCamera}
              className="mt-4"
            />
            <AppButton
              title={t('selectStepScreen.gallery')}
              icon="image"
              variant="secondary"
              onPress={pickFromLibrary}
              className="mt-3"
            />
          </View>
        </Modalize>
      </Portal>
    </View>
  );
}
