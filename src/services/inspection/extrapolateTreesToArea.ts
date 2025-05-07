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

  const treesTotal = samplingTrees.reduce((acc, val) => acc + val, 0);
  const treesAverage = treesTotal / samplingTrees.length;
  const densityPerM2 = treesAverage / samplingSize;
  const totalEstimated = densityPerM2 * totalArea;

  return Math.round(totalEstimated)
}
