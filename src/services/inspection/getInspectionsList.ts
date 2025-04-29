import Web3 from 'web3';
import {SEQUOIA_INSPECTION_RULES_ADDRESS, INSPECTION_RULES_ADDRESS} from '@env';
import SequoiaInspectionRules from '../../data/abis/sequoia/InspectionRules.json';
import InspectionRules from '../../data/abis/mainnet/InspectionRules.json';
import {InspectionProps} from '../../types/inspection';
import {parseInspectionData} from './parseInspectionData';

interface ReturnGetInspectionsListProps {
  success: boolean;
  inspections: InspectionProps[];
  message?: string;
}

interface GetInspectionsListProps {
  rpcUrl: string;
  testnet: boolean;
}
export async function getInspectionsList({
  rpcUrl,
  testnet,
}: GetInspectionsListProps): Promise<ReturnGetInspectionsListProps> {
  const abiToUse = testnet ? SequoiaInspectionRules.abi : InspectionRules.abi;
  const addressToUse = testnet
    ? SEQUOIA_INSPECTION_RULES_ADDRESS
    : INSPECTION_RULES_ADDRESS;

  const web3 = new Web3(rpcUrl);
  const InspectionContract = new web3.eth.Contract(abiToUse, addressToUse);

  try {
    const response = await InspectionContract.methods
      .inspectionsTotalCount()
      .call();
    const inspectionsCount = response
      ? parseInt(String(response)?.replace('n', ''))
      : 0;
    const ids = Array.from(
      {length: inspectionsCount},
      (_, i) => i + 1,
    ).reverse();

    const inspectionsList: InspectionProps[] = [];

    for (let i = 0; i < ids.length; i++) {
      const responseInspection = (await InspectionContract.methods
        .getInspection(ids[i])
        .call()) as InspectionProps;

      inspectionsList.push(parseInspectionData(responseInspection));
    }

    return {
      success: true,
      inspections: inspectionsList,
    };
  } catch (e) {
    console.log('Error: ' + e);
    return {
      success: false,
      inspections: [],
    };
  }
}
