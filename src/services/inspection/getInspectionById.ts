import Web3 from 'web3'
import {
  SEQUOIA_INSPECTION_RULES_ADDRESS,
  INSPECTION_RULES_ADDRESS
} from '@env'
import SequoiaInspectionRules from '../../data/abis/sequoia/InspectionRules.json'
import InspectionRules from '../../data/abis/mainnet/InspectionRules.json'

interface GetInspectionByIdProps {
  id: number;
  rpcUrl: string;
  testnet: boolean;
}
export async function getInspectionById({ id, rpcUrl, testnet }: GetInspectionByIdProps) {
  const abiToUse = testnet ? SequoiaInspectionRules.abi : InspectionRules.abi;
  const addressToUse = testnet ? SEQUOIA_INSPECTION_RULES_ADDRESS : INSPECTION_RULES_ADDRESS;

  const web3 = new Web3(rpcUrl)
  const InspectionContract = new web3.eth.Contract(abiToUse, addressToUse)

  try {
    const response = await InspectionContract.methods.getInspection(id).call()
    console.log(response)
  } catch(e) {
    console.log('Error: ' + e)
  }
}
