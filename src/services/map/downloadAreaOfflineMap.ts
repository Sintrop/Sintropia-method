import { offlineManager, StyleURL } from '@rnmapbox/maps';
import { CoordinateProps } from '../../types/regenerator';
import { boundsOf, coordinateToLngLat } from '../../utils/geo';

/**
 * Downloads the satellite tiles of the area so the map keeps working in the
 * field without signal. Packs are named by regenerator, so starting a new
 * collection for the same area replaces the previous pack.
 */
export async function downloadAreaOfflineMap(
  packName: string,
  coordinates: CoordinateProps[],
): Promise<void> {
  const bounds = boundsOf(coordinates.map(coordinateToLngLat));
  if (!bounds) return;

  try {
    const existing = await offlineManager.getPack(packName);
    if (existing) {
      await offlineManager.deletePack(packName);
    }

    await offlineManager.createPack(
      {
        name: packName,
        styleURL: StyleURL.SatelliteStreet,
        minZoom: 14,
        maxZoom: 19,
        bounds: [bounds.ne, bounds.sw],
      },
      () => {},
      (_pack, error) => {
        console.warn('Offline map download failed', error);
      },
    );
  } catch (error) {
    console.warn('Offline map download failed', error);
  }
}
