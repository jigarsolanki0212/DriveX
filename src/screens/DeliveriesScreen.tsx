import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator, Platform } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DeliveryCard } from '../components/DeliveryCard';
import { Delivery } from '../types';
import { useNavigation } from '@react-navigation/native';

const DeliveriesScreen = () => {
  const { user } = useAuth();
  const { colors, typography, radius, spacing, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDeliveries = useCallback(() => {
    if (!user) return;
    
    setLoading(true);
    return firestore()
      .collection('deliveries')
      .where('driverId', '==', user.uid)
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        (snapshot) => {
          const docs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Delivery[];
          setDeliveries(docs);
          setLoading(false);
          setRefreshing(false);
        },
        (error) => {
          console.error(error);
          setLoading(false);
          setRefreshing(false);
        }
      );
  }, [user]);

  useEffect(() => {
    const unsubscribe = fetchDeliveries();
    return () => unsubscribe && unsubscribe();
  }, [fetchDeliveries]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDeliveries();
  };

  const hasPending = deliveries.some(d => d.status === 'PENDING');

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={[typography.h2, { color: colors.text.secondary }]}>No deliveries found</Text>
      <Text style={[typography.body, { color: colors.text.secondary, textAlign: 'center', marginTop: 8 }]}>
        Your assigned deliveries will appear here.
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[typography.h1, { color: colors.text.primary }]}>Your Shipments</Text>
      </View>

      <FlatList
        data={deliveries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <DeliveryCard delivery={item} onPress={() => {}} />}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={loading ? null : renderEmpty}
      />

      {loading && !refreshing && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {deliveries.length > 0 && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity 
            style={[
              styles.fab, 
              { 
                backgroundColor: hasPending ? colors.primary : colors.text.secondary,
                borderRadius: radius.lg 
              }
            ]}
            onPress={() => navigation.navigate('OptimisedRoute')}
            disabled={!hasPending}
          >
            <Text style={[typography.h3, { color: 'white' }]}>View Optimised Route</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 24, paddingBottom: 16 },
  listContent: { paddingHorizontal: 24 },
  emptyContainer: { flex: 1, height: 400, justifyContent: 'center', alignItems: 'center', padding: 40 },
  loader: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.05)' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 24 },
  fab: { height: 60, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4.65, elevation: 8 }
});

export default DeliveriesScreen;
