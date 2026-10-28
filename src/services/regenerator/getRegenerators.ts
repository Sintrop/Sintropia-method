import { RegeneratorProps } from '../../types/regenerator';
import {
  getCommunityRulesContract,
  REGENERATOR_USER_TYPE,
  regeneratorRulesContract,
} from '../blockchain/contracts';
import { parseRegenerator } from './parseRegenerator';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

/**
 * Every regenerator ever registered, fetched in parallel: ids go from 1 to
 * userTypesTotalCount(REGENERATOR) and map to wallets in regeneratorsAddress.
 * Fully invalidated regenerators are left out because they can no longer be
 * inspected.
 */
export async function getRegenerators(): Promise<RegeneratorProps[]> {
  const communityRules = await getCommunityRulesContract();
  const total = Number(
    await communityRules.methods
      .userTypesTotalCount(REGENERATOR_USER_TYPE)
      .call(),
  );

  const ids = Array.from({ length: total }, (_, index) => index + 1);
  const addresses = (await Promise.all(
    ids.map(id =>
      regeneratorRulesContract.methods.regeneratorsAddress(id).call(),
    ),
  )) as unknown as string[];

  const regenerators = await Promise.all(
    addresses
      .filter(address => address && address !== ZERO_ADDRESS)
      .map(async address =>
        parseRegenerator(
          await regeneratorRulesContract.methods.getRegenerator(address).call(),
        ),
      ),
  );

  return regenerators.filter(regenerator => !regenerator.isFullyInvalidated);
}
