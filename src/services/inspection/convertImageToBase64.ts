import RNFS from 'react-native-fs';

export async function convertImageToBase64(uri: string): Promise<string> {
  const base64 = await RNFS.readFile(uri, 'base64');
  return 'data:image/jpeg;base64,' + base64;
}
