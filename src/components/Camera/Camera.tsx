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
  Platform,
} from 'react-native';
import {
  Camera,
  useCameraDevices,
  PhotoFile,
} from 'react-native-vision-camera';
import type { CameraDevice } from 'react-native-vision-camera';
import { Icon } from '../Icon/Icon';
import { usePermissions } from '../../hooks/usePermissions';
import { useSafeAreaApp } from '../../hooks/useSafeAreaApp';

interface Props {
  close: () => void;
  photo: (path: string) => void;
}

export function CameraComponent({ close, photo }: Props) {
  const { t } = useTranslation();
  const camera = useRef<Camera>(null);
  const devices = useCameraDevices();
  const backCamera: CameraDevice | undefined = devices.find(
    d => d.position === 'back',
  );
  const frontCamera: CameraDevice | undefined = devices.find(
    d => d.position === 'front',
  );
  const [imagePreview, setImagePreview] = useState<string>();
  const [loadingTake, setLoadingTake] = useState<boolean>(false);
  const [camToUse, setCamToUse] = useState<'front' | 'back'>('back');
  const { cameraStatus, checkCameraPermission, requestCameraPermission } =
    usePermissions();

  useEffect(() => {
    checkCameraPermission();
  }, []);

  async function handleTakePhoto() {
    try {
      setLoadingTake(true);
      const photo: PhotoFile | undefined = await camera.current?.takePhoto();
      if (photo?.path) {
        setImagePreview('file://' + photo.path);
      }
    } catch (e) {
      console.log(e);
      Alert.alert('Error', 'Erro ao tentar tirar a foto');
    } finally {
      setLoadingTake(false);
    }
  }

  function handleConfirmPhoto() {
    if (!imagePreview) return;
    photo(imagePreview);
    close();
  }

  function handleSwitchCam() {
    if (camToUse === 'back') setCamToUse('front');
    if (camToUse === 'front') setCamToUse('back');
  }

  if (cameraStatus !== 'granted') {
    return (
      <ModalContainer close={close} closeIconBlack>
        <View className="items-center justify-center h-screen p-5">
          <Text className="text-black text-center mt-10 font-semibold">
            {t('weNeedYourCameraPermission')}
          </Text>
          <Text className="text-black text-center mt-1">
            {t('descWeNeedYourCameraPermission')}
          </Text>

          <TouchableOpacity
            className="mt-10 w-fit px-10 h-10 rounded-2xl bg-blue-500 items-center justify-center"
            onPress={requestCameraPermission}
          >
            <Text className="text-white font-semibold">{t('continue')}</Text>
          </TouchableOpacity>

          <Text className="text-gray-500 text-xs text-center mt-5">
            {t('helpGiveCameraPermission')}
          </Text>
        </View>
      </ModalContainer>
    );
  }

  if (!backCamera) {
    return (
      <ModalContainer close={close}>
        <View className="w-screen h-screen items-center justify-center">
          <ActivityIndicator size={40} />
        </View>
      </ModalContainer>
    );
  }

  if (imagePreview) {
    return (
      <ModalContainer close={close}>
        <Image
          source={{ uri: imagePreview }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />

        <View className="flex-row items-center justify-center absolute bottom-5 w-full h-20">
          <TouchableOpacity
            className="bg-gray-300 rounded-2xl w-32 h-12 items-center justify-center"
            onPress={() => setImagePreview(undefined)}
          >
            <Text className="text-black">{t('takeAnother')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-green-600 rounded-2xl w-32 h-12 items-center justify-center ml-5"
            onPress={handleConfirmPhoto}
          >
            <Text className="text-white font-semibold">{t('confirm')}</Text>
          </TouchableOpacity>
        </View>
      </ModalContainer>
    );
  }

  return (
    <ModalContainer close={close}>
      <Camera
        style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]}
        //@ts-ignore
        device={camToUse === 'front' ? frontCamera : backCamera}
        isActive={true}
        ref={camera}
        photo={true}
        photoQualityBalance="speed"
      />

      <View style={styles.viewBtnsAction}>
        <View className="w-10 h-10 mr-10" />

        <TouchableOpacity
          onPress={handleTakePhoto}
          style={styles.captureButton}
          disabled={loadingTake}
        >
          {loadingTake ? (
            <ActivityIndicator size={30} />
          ) : (
            <Text style={styles.buttonText}>📸</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          className="w-10 h-10 ml-10 bg-white rounded-full items-center justify-center"
          onPress={handleSwitchCam}
        ></TouchableOpacity>
      </View>
    </ModalContainer>
  );
}

interface ModalContainerProps {
  children: ReactNode;
  close: () => void;
  closeIconBlack?: boolean;
}
function ModalContainer({
  children,
  close,
  closeIconBlack,
}: ModalContainerProps) {
  return (
    <Modal
      visible={true}
      animationType="slide"
      transparent
      onRequestClose={close}
    >
      <View className="flex-1 bg-white relative">
        <TouchableOpacity
          onPress={close}
          className={`absolute right-5 z-20 ${
            Platform.OS === 'android' ? 'top-5' : 'top-14'
          }`}
        >
          <Icon
            name="close"
            size={30}
            color={closeIconBlack ? 'black' : 'white'}
          />
        </TouchableOpacity>
        {children}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewBtnsAction: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    flexDirection: 'row',
  },
  captureButton: {
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 40,
    padding: 20,
    elevation: 4,
  },
  buttonText: {
    fontSize: 24,
  },
});
