import Web3 from "web3";

interface GetInspectionByIdProps {
  id: number;
  rpcUrl: string;
  testnet: boolean;
}
export async function getInspectionById({ id, rpcUrl }: GetInspectionByIdProps) {
  const web3 = new Web3(rpcUrl)

}