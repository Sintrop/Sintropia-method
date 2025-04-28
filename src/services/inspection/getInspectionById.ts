import Web3, { FMT_NUMBER } from 'web3'
import {
  SEQUOIA_INSPECTION_RULES_ADDRESS,
  INSPECTION_RULES_ADDRESS
} from '@env'
import SequoiaInspectionRules from '../../data/abis/sequoia/InspectionRules.json'
import InspectionRules from '../../data/abis/mainnet/InspectionRules.json'
import { InspectionProps } from '../../types/inspection';

interface ReturnGetInspectionByIdProps {
  success: boolean
  inspection?: InspectionProps
  message?: string
}

interface GetInspectionByIdProps {
  id: number;
  rpcUrl: string;
  testnet: boolean;
}
export async function getInspectionById(
  {
    id,
    rpcUrl,
    testnet
  }: GetInspectionByIdProps):
  Promise<ReturnGetInspectionByIdProps> {
  const abiToUse = testnet ? SequoiaInspectionRules.abi : InspectionRules.abi;
  const addressToUse = testnet ? SEQUOIA_INSPECTION_RULES_ADDRESS : INSPECTION_RULES_ADDRESS;

  const web3 = new Web3(rpcUrl)
  const InspectionContract = new web3.eth.Contract(abiToUse, addressToUse)

  try {
    const response = await InspectionContract.methods.getInspection(id).call() as InspectionProps

    if (response?.regenerator === '0x0000000000000000000000000000000000000000') {
      return {
        success: false,
        message: 'inspectionNotFound'
      }
    }

    const data: InspectionProps = {
      id: parseInt(String(response?.id).replace('n', '')),
      acceptedAt: parseInt(String(response?.acceptedAt).replace('n', '')),
      createdAt: parseInt(String(response?.createdAt).replace('n', '')),
      inspectedAt: parseInt(String(response?.inspectedAt).replace('n', '')),
      inspectedAtEra: parseInt(String(response?.inspectedAtEra).replace('n', '')),
      inspector: response?.inspector,
      invalidatedAt: parseInt(String(response?.invalidatedAt).replace('n', '')),
      proofPhoto: response?.proofPhoto,
      regenerationScore: parseInt(String(response?.regenerationScore).replace('n', '')),
      regenerator: response?.regenerator,
      report: response?.report,
      status: parseInt(String(response?.status).replace('n', '')),
      treesResult: parseInt(String(response?.treesResult).replace('n', '')),
      validationsCount: parseInt(String(response?.validationsCount).replace('n', ''))
    }

    return {
      success: true,
      inspection: data
    }
  } catch (e) {
    console.log('Error: ' + e)
    return {
      success: false
    }
  }
}
