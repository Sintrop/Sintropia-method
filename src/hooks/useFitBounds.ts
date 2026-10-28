import { useCallback, useEffect, useRef } from 'react';
import { Camera } from '@rnmapbox/maps';
import { Bounds } from '../utils/geo';

/**
 * Moving the camera before the map finishes loading is ignored on iOS (the
 * map stays on the default world view), so the fit only runs after
 * onDidFinishLoadingMap and again whenever the bounds change.
 */
export function useFitBounds(bounds: Bounds | null, padding = 40) {
  const cameraRef = useRef<Camera>(null);
  const mapLoaded = useRef(false);

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

  return { cameraRef, onMapLoaded };
}
