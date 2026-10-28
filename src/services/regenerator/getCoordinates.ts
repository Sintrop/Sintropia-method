import { CoordinateProps } from '../../types/regenerator';
import { regeneratorRulesContract } from '../blockchain/contracts';

export async function getCoordinates(
  address: string,
): Promise<CoordinateProps[]> {
  const response = (await regeneratorRulesContract.methods
    .getCoordinates(address)
    .call()) as unknown as CoordinateProps[];

  return response.map(coordinate => ({
    latitude: String(coordinate.latitude),
    longitude: String(coordinate.longitude),
  }));
}
