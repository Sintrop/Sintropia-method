import { useCallback, useState } from "react";
import { Platform } from "react-native";
import { check, request, openSettings, PERMISSIONS, RESULTS, Permission } from "react-native-permissions";

type PermissionStatus = 'unavailable' | 'denied' | 'blocked' | 'granted' | 'limited';

export function usePermissions() {
  const [cameraStatus, setCameraStatus] = useState<PermissionStatus>();
  const [locationStatus, setLocationStatus] = useState<PermissionStatus>();
  const [galleryStatus, setGalleryStatus] = useState<PermissionStatus>();

  const getPermission = useCallback(async (permission: Permission, setStatus: (status: PermissionStatus) => void) => {
    const result = await request(permission);
    setStatus(result);
    if (result === RESULTS.BLOCKED) {
      openSettings();
    }
    return result;
  }, []);

  const checkPermission = useCallback(async (permission: Permission) => {
    return await check(permission);
  }, []);

  const requestCameraPermission = useCallback(() => {
    const permission =
      Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA;
    return getPermission(permission, setCameraStatus);
  }, [getPermission]);

  const checkCameraPermission = useCallback(async () => {
    const permission =
      Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA;

    const permissionStatus = await checkPermission(permission);
    setCameraStatus(permissionStatus);

    return permissionStatus;
  }, [checkPermission]);

  const requestLocationPermission = useCallback(() => {
    const permission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
    return getPermission(permission, setLocationStatus);
  }, [getPermission]);

  const checkLocationPermission = useCallback(async () => {
    const permission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
    
    const permissionStatus = await checkPermission(permission);
    setLocationStatus(permissionStatus);

    return permissionStatus;
  }, [checkPermission]);

  // const requestGalleryPermission = useCallback(() => {
  //   const androidVersion = Platform.OS === 'android' ? Number(Platform.Version) : 0;
  //   const permission =
  //     Platform.OS === 'ios'
  //       ? PERMISSIONS.IOS.PHOTO_LIBRARY
  //       : androidVersion >= 33
  //       ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES // Android 13+
  //       : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE; // Android <=12

  //   return getPermission(permission, setGalleryStatus);
  // }, [getPermission]);

  // const checkGalleryPermission = useCallback(async () => {
  //   const androidVersion = Platform.OS === 'android' ? Number(Platform.Version) : 0;
  //   const permission =
  //     Platform.OS === 'ios'
  //       ? PERMISSIONS.IOS.PHOTO_LIBRARY
  //       : androidVersion >= 33
  //       ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
  //       : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;

  //   const permissionStatus = await checkPermission(permission);
  //   setGalleryStatus(permissionStatus);

  //   return permissionStatus;
  // }, [checkPermission]);

  return {
    cameraStatus,
    locationStatus,
    galleryStatus,
    requestCameraPermission,
    requestLocationPermission,
    // requestGalleryPermission,
    checkLocationPermission,
    checkCameraPermission,
    // checkGalleryPermission
  }
}