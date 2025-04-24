import { useSafeAreaInsets } from 'react-native-safe-area-context'

export function useSafeAreaApp() {
  const { top, bottom } = useSafeAreaInsets()

  return {
    top: top,
    bottom: Math.max(bottom, 20)
  }
}
