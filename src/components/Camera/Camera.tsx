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
import type { CameraDevice } from 'react-native-vision-camera';

interface Props {
  close: () => void;
  photo: (path: string) => void;
}

export function CameraComponent({ close, photo }: Props) {
  const { t } = useTranslation();
  const [hasPermission, setHasPermission] = useState(false);
  const camera = useRef<Camera>(null);
  const devices = useCameraDevices();
  const backCamera: CameraDevice | undefined = devices.find(
    d => d.position === 'back',
  );
  const [imagePreview, setImagePreview] = useState<string>();
  const [loadingTake, setLoadingTake] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');
    })();
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
      Alert.alert('Error', 'Erro ao tentar tirar a foto')
    } finally {
      setLoadingTake(false)
    }
  }

  function handleConfirmPhoto(){
    if (!imagePreview) return;
    photo(imagePreview);
    close();
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

  if (!hasPermission) {
    return (
      <ModalContainer close={close}>
        <View className="w-screen h-screen items-center justify-center">
          <Text>{t('weNeedYourPermissionToUseYourCamera')}</Text>
        </View>
      </ModalContainer>
    );
  }


  if (imagePreview) {
    return (
      <ModalContainer close={close}>
        <Image
          source={{uri: imagePreview}}
          style={{width: '100%', height: '100%'}}
          resizeMode='cover'
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
    )
  }

  return (
    <ModalContainer close={close}>
      <TouchableOpacity 
        onPress={close} 
        className="absolute w-12 h-12 bg-white rounded-full top-5 left-5"
      >
        <Text>close</Text>
      </TouchableOpacity>
      <Camera
        style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]}
        device={backCamera}
        isActive={true}
        ref={camera}
        photo={true}
        photoQualityBalance='speed'
      />
      <TouchableOpacity 
        onPress={handleTakePhoto} 
        style={styles.captureButton}
        disabled={loadingTake}
      >
        {loadingTake ? (
          <ActivityIndicator size={30}/>
        ) : (
          <Text style={styles.buttonText}>📸</Text>
        )}
      </TouchableOpacity>
    </ModalContainer>
  );
}

interface ModalContainerProps {
  children: ReactNode;
  close: () => void;
}
function ModalContainer({ children, close }: ModalContainerProps) {
  return (
    <Modal
      visible={true}
      animationType="slide"
      transparent
      onRequestClose={close}
    >
      <View className="flex-1 bg-white">{children}</View>
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
  captureButton: {
    position: 'absolute',
    bottom: 40,
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
