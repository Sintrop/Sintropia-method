import Web3 from 'web3'
import {
  SEQUOIA_REGENERATOR_RULES_ADDRESS,
  REGENERATOR_RULES_ADDRESS
} from '@env'
import SequoiaRegeneratorRules from '../../data/abis/sequoia/RegeneratorRules.json'
import RegeneratorRules from '../../data/abis/mainnet/RegeneratorRules.json'
import { CoordinateProps } from '../../types/regenerator'

interface ReturnGetCoordinatesProps {
  success: boolean
  coords: CoordinateProps[]
  messsage?: string
}
interface GetCoordinatesProps {
  address: string
  coordinatesCount: number
  rpcUrl: string
  testnet: boolean
}
export async function getCoordinates({
  address,
  coordinatesCount,
  rpcUrl,
  testnet
}: GetCoordinatesProps): Promise<ReturnGetCoordinatesProps> {
  const abiToUse = testnet ? SequoiaRegeneratorRules.abi : RegeneratorRules.abi;
  const addressToUse = testnet ? SEQUOIA_REGENERATOR_RULES_ADDRESS : REGENERATOR_RULES_ADDRESS;

  const web3 = new Web3(rpcUrl)
  const RegeneratorContract = new web3.eth.Contract(abiToUse, addressToUse)

  let coords: CoordinateProps[] = []

  try {
    for (var i = 0; i < coordinatesCount; i++) {
      const response = await RegeneratorContract.methods.coordinates(address, i).call() as CoordinateProps
      coords.push({
        latitude: response.latitude,
        longitude: response.longitude
      })
    }

    return {
      success: true,
      coords
    }
  } catch (e) {
    console.log(e)
    return {
      success: false,
      coords: []
    }
  }
}