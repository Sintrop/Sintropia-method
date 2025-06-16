import RNFS from 'react-native-fs';
import ImageResizer from 'react-native-image-resizer';

export async function convertImageToBase64(uri: string, width?: number, height?: number): Promise<string> {
  if ( !uri.includes('file://') ) return ''

  const widthToResize = width ? width : 100;
  const heightToResize = height ? height : 130;
  const resized = await ImageResizer.createResizedImage(uri, widthToResize, heightToResize, 'JPEG', 60);

  const base64 = await RNFS.readFile(resized.uri, 'base64');
  return 'data:image/jpeg;base64,' + base64;
}
