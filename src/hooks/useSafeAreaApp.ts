import { useSafeAreaInsets } from 'react-native-safe-area-context'

export function useSafeAreaApp() {
  const { top, bottom } = useSafeAreaInsets()

  return {
    top: Math.max(top, 20),
    bottom: Math.max(bottom, 20)
  }
}
