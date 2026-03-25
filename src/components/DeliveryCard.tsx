import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../theme';
import { GlassCard } from './GlassCard';
import { Delivery } from '../types';

interface DeliveryCardProps {
  delivery: Delivery;
  onPress: () => void;
}

const statusColors = {
  PENDING: '#F59E0B',
  IN_PROGRESS: '#3B82F6',
  DELIVERED: '#10B981',
  FAILED: '#EF4444',
};

export const DeliveryCard: React.FC<DeliveryCardProps> = ({ delivery, onPress }) => {
  const { colors, typography, radius, spacing } = useTheme();

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <GlassCard style={styles.card}>
        <View style={styles.header}>
          <Text style={[typography.label, styles.orderId, { color: colors.primary }]}>{delivery.orderId}</Text>
          <View style={[styles.badge, { backgroundColor: statusColors[delivery.status] + '20' }]}>
            <View style={[styles.dot, { backgroundColor: statusColors[delivery.status] }]} />
            <Text style={[typography.caption, { color: statusColors[delivery.status], fontWeight: '600' }]}>{delivery.status}</Text>
          </View>
        </View>

        <Text style={[typography.h3, { color: colors.text.primary, marginBottom: spacing.xs }]}>{delivery.customerName}</Text>
        <Text style={[typography.body, { color: colors.text.secondary }]} numberOfLines={2}>{delivery.address}</Text>
      </GlassCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '700',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  }
});
