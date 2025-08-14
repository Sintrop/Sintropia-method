import RNFS from 'react-native-fs';
import ImageResizer from 'react-native-image-resizer';

interface Props {
  uri: string;
  width?: number;
  height?: number;
}
export async function convertImageToBase64({ uri, height = 150, width = 150 }: Props): Promise<string> {
  if (!uri.includes('file://')) return ''

  const resized = await ImageResizer.createResizedImage(uri, width, height, 'JPEG', 80);

  const base64 = await RNFS.readFile(resized.uri, 'base64');
  return 'data:image/jpeg;base64,' + base64;
}
