import RNFS from 'react-native-fs';
import ImageResizer from 'react-native-image-resizer';

export async function convertImageToBase64(uri: string): Promise<string> {
  if ( !uri.includes('file://') ) return ''

  const resized = await ImageResizer.createResizedImage(uri, 100, 130, 'JPEG', 60);

  const base64 = await RNFS.readFile(resized.uri, 'base64');
  return 'data:image/jpeg;base64,' + base64;
}
