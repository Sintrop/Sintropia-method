import Web3 from 'web3';
import {
  SEQUOIA_REGENERATOR_RULES_ADDRESS,
  REGENERATOR_RULES_ADDRESS,
} from '@env';
import SequoiaRegeneratorRules from '../../data/abis/sequoia/RegeneratorRules.json';
import RegeneratorRules from '../../data/abis/mainnet/RegeneratorRules.json';
import { RegeneratorProps } from '../../types/regenerator';

interface ReturnGetRegeneratorByAddressProps {
  success: boolean;
  regenerator?: RegeneratorProps;
  message?: string;
}
interface GetRegeneratorByAddressProps {
  address: string;
  rpcUrl: string;
  testnet: boolean;
}
export async function getRegeneratorByAddress({
  address,
  rpcUrl,
  testnet,
}: GetRegeneratorByAddressProps): Promise<ReturnGetRegeneratorByAddressProps> {
  const abiToUse = testnet ? SequoiaRegeneratorRules.abi : RegeneratorRules.abi;
  const addressToUse = testnet
    ? SEQUOIA_REGENERATOR_RULES_ADDRESS
    : REGENERATOR_RULES_ADDRESS;

  const web3 = new Web3(rpcUrl);
  const RegeneratorContract = new web3.eth.Contract(abiToUse, addressToUse);

  try {
    const response = (await RegeneratorContract.methods
      .getRegenerator(address)
      .call()) as RegeneratorProps;

    const data: RegeneratorProps = {
      id: parseInt(String(response?.id).replace('n', '')),
      coordinatesCount: parseInt(
        String(response?.coordinatesCount).replace('n', ''),
      ),
      createdAt: parseInt(String(response?.createdAt).replace('n', '')),
      lastRequestAt: parseInt(String(response?.lastRequestAt).replace('n', '')),
      name: response?.name,
      pendingInspection: response?.pendingInspection,
      pool: {
        currentEra: parseInt(
          String(response?.pool?.currentEra).replace('n', ''),
        ),
        onContractPool: response.pool.onContractPool,
      },
      proofPhoto: response.proofPhoto,
      regenerationScore: {
        score: parseInt(
          String(response?.regenerationScore.score).replace('n', ''),
        ),
      },
      regeneratorWallet: response.regeneratorWallet,
      totalArea: parseInt(String(response?.totalArea).replace('n', '')),
      totalInspections: parseInt(
        String(response?.totalInspections).replace('n', ''),
      ),
    };

    return {
      success: true,
      regenerator: data,
    };
  } catch (e) {
    console.log('Error: ' + e);
    return {
      success: false,
    };
  }
}
