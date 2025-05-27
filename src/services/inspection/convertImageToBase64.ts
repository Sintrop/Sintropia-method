import RNFS from 'react-native-fs';
import { Image } from 'react-native-compressor';

export async function convertImageToBase64(uri: string): Promise<string> {
  if ( !uri.includes('file://') ) return ''

  const imageCompressed = await Image.compress(uri, {
    compressionMethod: 'auto',
    quality: 0.1,
  })

  const base64 = await RNFS.readFile(imageCompressed, 'base64');
  return 'data:image/jpeg;base64,' + base64;
}
