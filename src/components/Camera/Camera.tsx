import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Image,
  Alert,
} from 'react-native';
import {
  Camera,
  useCameraDevices,
  PhotoFile,
} from 'react-native-vision-camera';
import { launchImageLibrary } from 'react-native-image-picker';
import { Icon } from '../Icon/Icon';
import { usePermissions } from '../../hooks/usePermissions';
import { useSafeAreaApp } from '../../hooks/useSafeAreaApp';
import colors from '../../theme/colors';

interface Props {
  close: () => void;
  photo: (path: string) => void;
}

export function CameraComponent({ close, photo }: Props) {
  const { t } = useTranslation();
  const camera = useRef<Camera>(null);
  const devices = useCameraDevices();
  const backCamera = devices.find(d => d.position === 'back');
  const frontCamera = devices.find(d => d.position === 'front');
  const [imagePreview, setImagePreview] = useState<string>();
  const [loadingTake, setLoadingTake] = useState<boolean>(false);
  const [camToUse, setCamToUse] = useState<'front' | 'back'>('back');
  const [noCamera, setNoCamera] = useState(false);
  const { requestCameraPermission } = usePermissions();
  const { top, bottom } = useSafeAreaApp();

  useEffect(() => {
    requestCameraPermission();
  }, []);

  useEffect(() => {
    if (backCamera) return;
    const timeout = setTimeout(() => setNoCamera(true), 2000);
    return () => clearTimeout(timeout);
  }, [backCamera]);

  async function handleTakePhoto() {
    try {
      setLoadingTake(true);
      const result: PhotoFile | undefined = await camera.current?.takePhoto();
      if (result?.path) {
        setImagePreview('file://' + result.path);
      }
    } catch (e) {
      console.log(e);
      Alert.alert(t('atention'), t('camera.error'));
    } finally {
      setLoadingTake(false);
    }
  }

  // Only reachable in development builds (the simulator has no camera).
  async function handlePickFromLibrary() {
    const result = await launchImageLibrary({ mediaType: 'photo' });
    const uri = result.assets?.[0]?.uri;
    if (uri) setImagePreview(uri);
  }

  function handleConfirmPhoto() {
    if (!imagePreview) return;
    photo(imagePreview);
    close();
  }

  const closeButton = (
    <TouchableOpacity
      onPress={close}
      className="absolute right-5 z-20 w-11 h-11 rounded-full bg-black/40 items-center justify-center"
      style={{ top: top + 8 }}
    >
      <Icon name="close" size={24} color="white" />
    </TouchableOpacity>
  );

  if (imagePreview) {
    return (
      <ModalContainer onClose={close}>
        <Image
          source={{ uri: imagePreview }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
        {closeButton}
        <View
          className="absolute left-0 right-0 flex-row px-5"
          style={{ bottom: bottom + 16 }}
        >
          <TouchableOpacity
            className="flex-1 h-14 rounded-2xl bg-white/90 items-center justify-center mr-3"
            onPress={() => setImagePreview(undefined)}
          >
            <Text className="text-ink font-semibold">{t('takeAnother')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 h-14 rounded-2xl bg-brand flex-row items-center justify-center"
            onPress={handleConfirmPhoto}
          >
            <Icon name="check" size={20} color="white" />
            <Text className="text-white font-semibold ml-2">
              {t('confirm')}
            </Text>
          </TouchableOpacity>
        </View>
      </ModalContainer>
    );
  }

  if (!backCamera) {
    return (
      <ModalContainer onClose={close}>
        {closeButton}
        <View className="flex-1 items-center justify-center px-10">
          {noCamera ? (
            <>
              <Icon name="camera" size={40} color="white" />
              <Text className="text-white text-center mt-4">
                {t('camera.unavailable')}
              </Text>
              {__DEV__ && (
                <TouchableOpacity
                  className="mt-6 px-6 h-12 rounded-2xl bg-white items-center justify-center"
                  onPress={handlePickFromLibrary}
                >
                  <Text className="text-ink font-semibold">
                    {t('selectStepScreen.gallery')} (dev)
                  </Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <ActivityIndicator size="large" color="white" />
          )}
        </View>
      </ModalContainer>
    );
  }

  return (
    <ModalContainer onClose={close}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={(camToUse === 'front' && frontCamera) || backCamera}
        isActive={true}
        ref={camera}
        photo={true}
        photoQualityBalance="speed"
      />
      {closeButton}

      <View
        className="absolute left-0 right-0 flex-row items-center justify-center"
        style={{ bottom: bottom + 24 }}
      >
        <View className="w-12 h-12 mr-10" />

        <TouchableOpacity
          onPress={handleTakePhoto}
          disabled={loadingTake}
          className="w-20 h-20 rounded-full border-4 border-white items-center justify-center"
        >
          <View className="w-16 h-16 rounded-full bg-white items-center justify-center">
            {loadingTake && <ActivityIndicator color={colors.brand} />}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          className="w-12 h-12 ml-10 rounded-full bg-black/40 items-center justify-center"
          onPress={() =>
            setCamToUse(value => (value === 'back' ? 'front' : 'back'))
          }
        >
          <Icon name="shuffle" size={22} color="white" />
        </TouchableOpacity>
      </View>
    </ModalContainer>
  );
}

function ModalContainer({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <Modal
      visible
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black">{children}</View>
    </Modal>
  );
}
