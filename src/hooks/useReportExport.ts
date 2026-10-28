import { RefObject, useState } from 'react';
import { Alert } from 'react-native';
import Share from 'react-native-share';
import { format } from 'date-fns';
import { MapView } from '@rnmapbox/maps';
import { useTranslation } from 'react-i18next';
import { useSQLite } from './useSQLite';
import {
  AreaDBProps,
  BiodiversityDBProps,
  ProofPhotosDBProps,
  TreeDBProps,
} from '../types/database';
import { CoordinateProps } from '../types/regenerator';
import { convertImageToBase64 } from '../services/inspection/convertImageToBase64';
import { generateReportPDF } from '../services/inspection/generateReportPDF';
import {
  generateReportPDFSamplingMode,
  SamplingPDFProps,
} from '../services/inspection/generateReportPDFSamplingMode';
import { generateReportProofPhotos } from '../services/inspection/generateReportProofPhotos';
import { extrapolateTreesToArea } from '../services/inspection/extrapolateTreesToArea';
import { reportFileName } from '../services/report/reportFileName';
import { APP_VERSION } from '../constants/app';

export interface ExportProgress {
  percent: number;
  message: 'optimizingPictures' | 'creatingPDF';
}

/**
 * Builds and shares the inspection and proof photos PDFs of a collection.
 * Data is read at export time, so it always matches what was registered,
 * and the map image comes from the MapView passed in.
 */
export function useReportExport(
  area: AreaDBProps | undefined,
  method: string,
  mapRef: RefObject<MapView>,
) {
  const { t } = useTranslation();
  const {
    fetchBiodiversityByAreaId,
    fetchSampligsArea,
    fetchTreesByAreaId,
    fetchProofPhotosArea,
  } = useSQLite();
  const [progress, setProgress] = useState<ExportProgress | null>(null);

  async function captureMap(): Promise<string> {
    try {
      return (await mapRef.current?.takeSnap(false)) ?? '';
    } catch (e) {
      console.warn('Map snapshot failed', e);
      return '';
    }
  }

  async function toBase64<T extends { photo: string }>(
    items: T[],
    onDone: () => void,
    size?: number,
  ): Promise<T[]> {
    const converted: T[] = [];
    for (const item of items) {
      converted.push({
        ...item,
        photo: await convertImageToBase64({
          uri: item.photo,
          width: size,
          height: size,
        }),
      });
      onDone();
    }
    return converted;
  }

  function commonData(target: AreaDBProps, now: Date) {
    return {
      areaName: target.name,
      coordinates: JSON.parse(target.coordinates) as CoordinateProps[],
      areaSize: `${Intl.NumberFormat('pt-BR').format(target.size)} m²`,
      regenerator: { address: target.regeneratorAddress },
      date: format(now, 'dd/MM/yyyy'),
      version: APP_VERSION,
    };
  }

  async function buildInspectionReport(target: AreaDBProps): Promise<string> {
    const [biodiversity, trees, samplings] = await Promise.all([
      fetchBiodiversityByAreaId(target.id),
      fetchTreesByAreaId(target.id),
      fetchSampligsArea(target.id),
    ]);

    const total = Math.max(biodiversity.length + trees.length, 1);
    let done = 0;
    const step = () => {
      done += 1;
      setProgress({
        percent: Math.ceil((done / total) * 100),
        message: 'optimizingPictures',
      });
    };

    const bioPdf: BiodiversityDBProps[] = await toBase64(biodiversity, step);
    const treesPdf: TreeDBProps[] = await toBase64(trees, step);

    setProgress({ percent: 100, message: 'creatingPDF' });
    const now = new Date();
    const base = {
      ...commonData(target, now),
      mapImage: await captureMap(),
      fileName: reportFileName(target.name, now),
      biodiversity: bioPdf,
      biodiversityCount: biodiversity.length,
      inspectorReport: target.inspectorReport,
    };

    if (method === 'manual') {
      return generateReportPDF({
        ...base,
        trees: treesPdf,
        treesCount: trees.length,
      });
    }

    const samplingsPdf: SamplingPDFProps[] = samplings.map(
      (sampling, index) => ({
        samplingNumber: index + 1,
        size: sampling.size,
        trees: treesPdf.filter(tree => tree.samplingId === sampling.id),
      }),
    );

    return generateReportPDFSamplingMode({
      ...base,
      samplings: samplingsPdf,
      treesCount:
        samplings.length === 0
          ? 0
          : extrapolateTreesToArea({
              samplingSize: samplings[0].size,
              samplingTrees: samplingsPdf.map(s => s.trees.length),
              totalArea: target.size,
            }),
    });
  }

  async function buildProofPhotosReport(target: AreaDBProps): Promise<string> {
    const photos = await fetchProofPhotosArea(target.id);
    const total = photos.length + 1;
    let done = 0;
    const step = () => {
      done += 1;
      setProgress({
        percent: Math.ceil((done / total) * 100),
        message: 'optimizingPictures',
      });
    };

    const photosPdf: ProofPhotosDBProps[] = await toBase64(photos, step, 500);
    const proofPhoto = target.proofPhoto
      ? await convertImageToBase64({
          uri: target.proofPhoto,
          width: 500,
          height: 500,
        })
      : '';
    step();

    setProgress({ percent: 100, message: 'creatingPDF' });
    const now = new Date();
    return generateReportProofPhotos({
      ...commonData(target, now),
      mapImage: await captureMap(),
      fileName: reportFileName(target.name, now, 'photos'),
      proofPhotos: photosPdf,
      proofPhoto,
    });
  }

  async function run(build: (target: AreaDBProps) => Promise<string>) {
    if (!area || progress) return;
    setProgress({ percent: 0, message: 'optimizingPictures' });
    try {
      const url = await build(area);
      setProgress(null);
      await Share.open({ url, type: 'application/pdf', failOnCancel: false });
    } catch (e) {
      console.warn(e);
      setProgress(null);
      Alert.alert(t('atention'), t('reportScreen.exportError'));
    }
  }

  return {
    progress,
    shareInspectionReport: () => run(buildInspectionReport),
    shareProofPhotos: () => run(buildProofPhotosReport),
  };
}
