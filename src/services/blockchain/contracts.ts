import Web3 from 'web3';
import Config from 'react-native-config';
import RegeneratorRulesJson from '../../data/abis/mainnet/RegeneratorRules.json';

export const RPC_URL = 'https://rpc.sintrop.com';

/** CommunityTypes.UserType.REGENERATOR in the core contracts. */
export const REGENERATOR_USER_TYPE = 1;

const CommunityRulesAbi = [
  {
    inputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    name: 'userTypesTotalCount',
    outputs: [{ internalType: 'uint64', name: '', type: 'uint64' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const web3 = new Web3(RPC_URL);

export const regeneratorRulesContract = new web3.eth.Contract(
  RegeneratorRulesJson.abi,
  Config.REGENERATOR_RULES_ADDRESS,
);

export async function getCommunityRulesContract() {
  const address = (await regeneratorRulesContract.methods
    .communityRules()
    .call()) as unknown as string;
  return new web3.eth.Contract(CommunityRulesAbi, address);
}
