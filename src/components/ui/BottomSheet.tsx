import React, { ReactNode, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaApp } from '../../hooks/useSafeAreaApp';

interface Props {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Bottom sheet drawn in the screen itself rather than in a native modal, so
 * it can open right after the camera modal closes (iOS refuses to present a
 * modal while another one is being dismissed).
 */
export function BottomSheet({ visible, onClose, children }: Props) {
  const { height } = useWindowDimensions();
  const { bottom } = useSafeAreaApp();
  const progress = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) setMounted(true);
    Animated.timing(progress, {
      toValue: visible ? 1 : 0,
      duration: visible ? 260 : 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && !visible) setMounted(false);
    });
  }, [visible, progress]);

  if (!mounted) return null;

  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          styles.backdrop,
          { opacity: progress },
        ]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      <Animated.View
        style={[
          styles.sheet,
          {
            paddingBottom: bottom + 8,
            transform: [
              {
                translateY: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [height, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.handle} />
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E3E8E4',
    marginBottom: 14,
  },
});
