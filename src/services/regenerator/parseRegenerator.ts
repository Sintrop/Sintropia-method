import { RegeneratorProps } from '../../types/regenerator';

type RawValue = bigint | number | string | undefined;

function toNumber(value: RawValue): number {
  return value === undefined ? 0 : Number(value);
}

// web3 returns uint fields as bigint; the app works with plain numbers.
export function parseRegenerator(raw: any): RegeneratorProps {
  return {
    id: toNumber(raw?.id),
    regeneratorWallet: raw?.regeneratorWallet,
    name: String(raw?.name ?? '').trim(),
    proofPhoto: raw?.proofPhoto,
    pendingInspection: Boolean(raw?.pendingInspection),
    totalInspections: toNumber(raw?.totalInspections),
    lastRequestAt: toNumber(raw?.lastRequestAt),
    totalArea: toNumber(raw?.totalArea),
    regenerationScore: { score: toNumber(raw?.regenerationScore?.score) },
    coordinatesCount: toNumber(raw?.coordinatesCount),
    pool: {
      onContractPool: Boolean(raw?.pool?.onContractPool),
      currentEra: toNumber(raw?.pool?.currentEra),
    },
    createdAt: toNumber(raw?.createdAt),
    isFullyInvalidated: Boolean(raw?.isFullyInvalidated),
  };
}
