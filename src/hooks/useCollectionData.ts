import { useCallback, useEffect, useState } from 'react';
import { useSQLite } from './useSQLite';
import {
  BiodiversityDBProps,
  ProofPhotosDBProps,
  SamplingDBProps,
  TreeDBProps,
} from '../types/database';

/** Everything registered for one collection, reloaded on demand. */
export function useCollectionData(areaId?: number) {
  const sqlite = useSQLite();
  const {
    db,
    fetchSampligsArea,
    fetchTreesByAreaId,
    fetchBiodiversityByAreaId,
    fetchProofPhotosArea,
  } = sqlite;
  const [samplings, setSamplings] = useState<SamplingDBProps[]>([]);
  const [trees, setTrees] = useState<TreeDBProps[]>([]);
  const [biodiversity, setBiodiversity] = useState<BiodiversityDBProps[]>([]);
  const [areaPhotos, setAreaPhotos] = useState<ProofPhotosDBProps[]>([]);
  const [loaded, setLoaded] = useState(false);

  const reload = useCallback(async () => {
    if (!db || areaId === undefined) return;
    const [s, t, b, p] = await Promise.all([
      fetchSampligsArea(areaId),
      fetchTreesByAreaId(areaId),
      fetchBiodiversityByAreaId(areaId),
      fetchProofPhotosArea(areaId),
    ]);
    setSamplings(s);
    setTrees(t);
    setBiodiversity(b);
    setAreaPhotos(p);
    setLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, areaId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return {
    ...sqlite,
    samplings,
    trees,
    biodiversity,
    areaPhotos,
    loaded,
    reload,
  };
}
