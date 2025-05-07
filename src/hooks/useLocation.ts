import { useEffect, useState } from "react"
import Geolocation, {
  GeoPosition,
  GeoError,
} from "react-native-geolocation-service";
import { PermissionsAndroid, Platform } from "react-native";

export function useLocation() {
  const [location, setLocation] = useState<GeoPosition | null>(null);
  const [error, setError] = useState<GeoError | null>(null);

  useEffect(() => {
    let watchId: number;

    async function requestPermission(): Promise<boolean> {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        )
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true;
    }

    async function startTracking() {
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        setError({
          code: 1,
          message: 'Permissão de localização negada.',
        } as GeoError);
        return;
      }

      watchId = Geolocation.watchPosition(
        (position) => {
          setLocation(position);
        },
        (err) => {
          setError(err)
        },
        {
          enableHighAccuracy: true,
          distanceFilter: 0,
          interval: 3000,
          fastestInterval: 2000,
        }
      )
    }

    startTracking();

    return () => {
      if (watchId != null) {
        Geolocation.clearWatch(watchId)
      };
    };
  }, []);

  return { location, error }
}