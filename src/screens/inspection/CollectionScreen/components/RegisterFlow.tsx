import React, { useEffect, useRef, useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CameraComponent } from '../../../../components/Camera/Camera';
import { AppButton } from '../../../../components/ui/AppButton';
import { Icon } from '../../../../components/Icon/Icon';
import { BottomSheet } from '../../../../components/ui/BottomSheet';
import { LngLat, SamplingShape } from '../../../../utils/geo';
import colors from '../../../../theme/colors';

export type RegisterType = 'tree' | 'biodiversity';

export interface RegisterRequest {
  type: RegisterType;
  position: LngLat;
  sampling?: SamplingShape;
}

export interface RegisterResult extends RegisterRequest {
  photo: string;
  alsoNewSpecies: boolean;
}

interface Props {
  request: RegisterRequest | null;
  onSave: (result: RegisterResult) => Promise<void>;
  onClose: () => void;
}

/**
 * Registering opens the camera straight away; after the photo a short sheet
 * confirms what is being saved. The position is the one at the moment the
 * button was pressed, so walking while framing the photo does not move it.
 */
export function RegisterFlow({ request, onSave, onClose }: Props) {
  const { t } = useTranslation();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [photo, setPhoto] = useState<string>();
  // The camera calls close() right after delivering the photo, before the
  // state update lands, so the latest photo is also kept in a ref.
  const photoRef = useRef<string>();
  const [alsoNewSpecies, setAlsoNewSpecies] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (request) {
      setPhoto(undefined);
      photoRef.current = undefined;
      setAlsoNewSpecies(false);
      setShowCamera(true);
    }
  }, [request]);

  function handlePhoto(uri: string) {
    photoRef.current = uri;
    setPhoto(uri);
    setShowCamera(false);
    setSheetOpen(true);
  }

  function handleCloseCamera() {
    setShowCamera(false);
    if (!photoRef.current) onClose();
  }

  async function handleSave() {
    if (!request || !photo) return;
    setSaving(true);
    await onSave({ ...request, photo, alsoNewSpecies });
    setSaving(false);
    setSheetOpen(false);
    onClose();
  }

  function handleRetake() {
    setSheetOpen(false);
    setShowCamera(true);
  }

  function handleDismiss() {
    setSheetOpen(false);
    onClose();
  }

  const isTree = request?.type === 'tree';

  return (
    <>
      {showCamera && (
        <CameraComponent close={handleCloseCamera} photo={handlePhoto} />
      )}

      <BottomSheet visible={sheetOpen} onClose={handleDismiss}>
        {request && (
          <View>
            <View className="flex-row items-center">
              <View
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{
                  backgroundColor: isTree ? colors.tree : colors.bio,
                }}
              >
                <Icon
                  name={isTree ? 'tree' : 'leaf'}
                  color="#FFFFFF"
                  size={20}
                />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-lg font-bold text-ink">
                  {isTree
                    ? t('collection.register.newTree')
                    : t('collection.register.newSpecies')}
                </Text>
                <Text className="text-sm text-muted">
                  {request.sampling
                    ? t('collection.register.inSampling', {
                        number: request.sampling.number,
                      })
                    : t('collection.register.inArea')}
                </Text>
              </View>
            </View>

            <View className="flex-row mt-5">
              {photo && (
                <Image
                  source={{ uri: photo }}
                  className="w-28 h-28 rounded-2xl bg-line"
                  resizeMode="cover"
                />
              )}
              <View className="flex-1 ml-4 justify-center">
                <Text className="text-xs text-muted">
                  {t('collection.register.position')}
                </Text>
                <Text className="text-sm text-ink">
                  {request.position[1].toFixed(6)},{' '}
                  {request.position[0].toFixed(6)}
                </Text>
                <TouchableOpacity
                  onPress={handleRetake}
                  className="flex-row items-center mt-3"
                >
                  <Icon name="camera" size={16} color={colors.brand} />
                  <Text className="text-brand font-semibold ml-1.5">
                    {t('collection.register.retake')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {isTree && (
              <TouchableOpacity
                className="flex-row items-center mt-5 p-3 rounded-2xl bg-canvas"
                onPress={() => setAlsoNewSpecies(value => !value)}
              >
                <View
                  className={`w-6 h-6 rounded-lg border-2 items-center justify-center ${
                    alsoNewSpecies ? 'bg-brand border-brand' : 'border-line'
                  }`}
                >
                  {alsoNewSpecies && (
                    <Icon name="check" size={16} color="#FFFFFF" />
                  )}
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-ink font-semibold">
                    {t('collection.register.alsoNewSpecies')}
                  </Text>
                  <Text className="text-xs text-muted">
                    {t('collection.register.alsoNewSpeciesHint')}
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            <AppButton
              title={t('collection.register.save')}
              icon="check"
              onPress={handleSave}
              loading={saving}
              className="mt-5"
            />
          </View>
        )}
      </BottomSheet>
    </>
  );
}
