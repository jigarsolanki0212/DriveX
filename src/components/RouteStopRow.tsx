import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking } from 'react-native';
import { useTheme } from '../theme';
import { Delivery } from '../types';
import Animated, { FadeOutRight } from 'react-native-reanimated';
import { GlassCard } from './GlassCard';

interface RouteStopRowProps {
  stop: Delivery;
  index: number;
  duration: string;
  onDelivered: (id: string) => void;
  onFailed: (id: string) => void;
}

export const RouteStopRow: React.FC<RouteStopRowProps> = ({ stop, index, duration, onDelivered, onFailed }) => {
  const { colors, typography, radius, spacing } = useTheme();

  const handleLongPress = () => {
    Alert.alert(
      "Manage Stop",
      `What would you like to do for ${stop.customerName}?`,
      [
        { text: "Call Customer", onPress: () => Linking.openURL(`tel:${stop.phone || '0000000000'}`) },
        { text: "Mark Failed", onPress: () => onFailed(stop.id), style: 'destructive' },
        { text: "Cancel", style: 'cancel' }
      ]
    );
  };

  return (
    <Animated.View exiting={FadeOutRight}>
      <TouchableOpacity onLongPress={handleLongPress} activeOpacity={0.8}>
        <GlassCard style={styles.card}>
          <View style={styles.content}>
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text style={[typography.h3, { color: 'white' }]}>{index + 1}</Text>
            </View>
            
            <View style={styles.textContainer}>
              <Text style={[typography.h3, { color: colors.text.primary }]}>{stop.customerName}</Text>
              <Text style={[typography.caption, { color: colors.text.secondary }]} numberOfLines={1}>{stop.address}</Text>
              <View style={styles.chip}>
                <Text style={[typography.label, { color: colors.primary }]}> Est. {duration}</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.doneButton, { backgroundColor: colors.success, borderRadius: radius.md }]}
              onPress={() => onDelivered(stop.id)}
            >
              <Text style={[typography.caption, { color: 'white', fontWeight: 'bold' }]}>DONE</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: { marginBottom: 12, padding: 12 },
  content: { flexDirection: 'row', alignItems: 'center' },
  badge: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  textContainer: { flex: 1, marginHorizontal: 12 },
  chip: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, backgroundColor: 'rgba(99, 102, 241, 0.1)', borderRadius: 8, marginTop: 4 },
  doneButton: { paddingVertical: 8, paddingHorizontal: 12 }
});
