import Web3 from 'web3';
import SequoiaInspectionRules from '../../data/abis/sequoia/InspectionRules.json';
import InspectionRules from '../../data/abis/mainnet/InspectionRules.json';
import {InspectionProps} from '../../types/inspection';
import {parseInspectionData} from './parseInspectionData';
import Config from 'react-native-config';

const SEQUOIA_INSPECTION_RULES_ADDRESS = Config.SEQUOIA_INSPECTION_RULES_ADDRESS;
const INSPECTION_RULES_ADDRESS = Config.INSPECTION_RULES_ADDRESS;

interface ReturnGetInspectionByIdProps {
  success: boolean;
  inspection?: InspectionProps;
  message?: string;
}

interface GetInspectionByIdProps {
  id: number;
  rpcUrl: string;
  testnet: boolean;
}
export async function getInspectionById({
  id,
  rpcUrl,
  testnet,
}: GetInspectionByIdProps): Promise<ReturnGetInspectionByIdProps> {
  const abiToUse = testnet ? SequoiaInspectionRules.abi : InspectionRules.abi;
  const addressToUse = testnet
    ? SEQUOIA_INSPECTION_RULES_ADDRESS
    : INSPECTION_RULES_ADDRESS;

  const web3 = new Web3(rpcUrl);
  const InspectionContract = new web3.eth.Contract(abiToUse, addressToUse);

  try {
    const response = (await InspectionContract.methods
      .getInspection(id)
      .call()) as InspectionProps;

    if (
      response?.regenerator === '0x0000000000000000000000000000000000000000'
    ) {
      return {
        success: false,
        message: 'inspectionNotFound',
      };
    }

    return {
      success: true,
      inspection: parseInspectionData(response),
    };
  } catch (e) {
    console.log('Error: ' + e);
    return {
      success: false,
    };
  }
}
