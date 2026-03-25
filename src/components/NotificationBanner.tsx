import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import messaging from '@react-native-firebase/messaging';

const { width } = Dimensions.get('window');

export const NotificationBanner = () => {
  const { colors, typography, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<any>(null);
  
  const translateY = useSharedValue(-150);

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      setData(remoteMessage.notification);
      translateY.value = withSpring(insets.top + 16);
      
      setTimeout(() => {
        dismiss();
      }, 5000);
    });
    return unsubscribe;
  }, [insets.top]);

  const dismiss = () => {
    translateY.value = withTiming(-150, {}, () => {
      runOnJS(setData)(null);
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }]
  }));

  if (!data) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle, { backgroundColor: colors.card, borderRadius: radius.lg, borderColor: colors.border }]}>
      <TouchableOpacity onPress={dismiss}>
        <View style={styles.content}>
          <Text style={[typography.h3, { color: colors.text.primary }]}>{data.title}</Text>
          <Text style={[typography.body, { color: colors.text.secondary }]} numberOfLines={1}>{data.body}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { position: 'absolute', top: 0, left: 16, right: 16, zIndex: 9999, padding: 16, borderWidth: 1, elevation: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4.65 },
  content: { flex: 1 }
});
