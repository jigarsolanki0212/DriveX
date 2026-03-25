import React from 'react';
import { View, StyleSheet, Platform, ViewStyle, StyleProp } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { useTheme } from '../theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, style }) => {
  const { colors, radius, isDark } = useTheme();

  return (
    <View style={[
      styles.container,
      {
        borderRadius: radius.xl,
        backgroundColor: isDark ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.15)',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.3)',
      },
      style
    ]}>
      {Platform.OS === 'ios' && (
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType={isDark ? "dark" : "light"}
          blurAmount={20}
          reducedTransparencyFallbackColor={isDark ? "rgba(0,0,0,0.8)" : "rgba(255,255,255,0.8)"}
        />
      )}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderWidth: 1,
    ...Platform.select({
      android: {
        elevation: 8,
        shadowColor: 'rgba(0,0,0,0.2)',
      }
    })
  },
  content: {
    padding: 16
  }
});
