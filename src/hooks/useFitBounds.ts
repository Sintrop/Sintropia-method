import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Camera, CameraStop } from '@rnmapbox/maps';
import { Bounds } from '../utils/geo';

/**
 * Keeps a map framed on the given bounds. The bounds go both into the
 * camera's defaultSettings, so the map is born on the area, and into a
 * fitBounds after onDidFinishLoadingMap, because on iOS a camera move issued
 * before the map loads is dropped and the map falls back to its default
 * position (Manhattan).
 */
export function useFitBounds(bounds: Bounds | null, padding = 40) {
  const cameraRef = useRef<Camera>(null);
  const mapLoaded = useRef(false);

  const defaultSettings = useMemo<CameraStop | undefined>(
    () =>
      bounds
        ? {
            bounds: {
              ne: bounds.ne,
              sw: bounds.sw,
              paddingTop: padding,
              paddingBottom: padding,
              paddingLeft: padding,
              paddingRight: padding,
            },
          }
        : undefined,
    [bounds, padding],
  );

  const fit = useCallback(() => {
    if (!bounds || !mapLoaded.current) return;
    cameraRef.current?.fitBounds(bounds.ne, bounds.sw, padding, 0);
  }, [bounds, padding]);

  useEffect(() => {
    fit();
  }, [fit]);

  const onMapLoaded = useCallback(() => {
    mapLoaded.current = true;
    fit();
  }, [fit]);

  return { cameraRef, onMapLoaded, defaultSettings };
}
