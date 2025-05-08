import { calculateAreaCircle } from "./calculateAreaCircle";

interface Props {
  totalArea: number;
  samplingSize: number;
  samplingTrees: number[];
}

export function extrapolateTreesToArea({
  samplingSize,
  samplingTrees,
  totalArea
} : Props): number {
  if (samplingTrees.length === 0) return 0;

  const samplingArea = calculateAreaCircle(samplingSize);
  const treesTotal = samplingTrees.reduce((acc, val) => acc + val, 0);
  const treesAverage = treesTotal / samplingTrees.length;
  const densityPerM2 = treesAverage / samplingArea;
  const totalEstimated = densityPerM2 * totalArea;

  return Math.round(totalEstimated)
}
