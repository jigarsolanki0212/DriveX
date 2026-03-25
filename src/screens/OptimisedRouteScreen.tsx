import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, ActivityIndicator, Alert, Platform } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import { useAuth } from '../hooks/useAuth';
import firestore from '@react-native-firebase/firestore';
import { Delivery } from '../types';
import { optimizeRoute, decodePolyline } from '../utils/routeOptimiser';
import { RouteStopRow } from '../components/RouteStopRow';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import Geolocation from '@react-native-community/geolocation'; // Note: User didn't specify version, standard is standard

const { height } = Dimensions.get('window');

const OptimisedRouteScreen = () => {
  const { colors, typography, radius, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const mapRef = useRef<MapView>(null);

  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [optimizedRoute, setOptimizedRoute] = useState<Delivery[]>([]);
  const [polyline, setPolyline] = useState<any[]>([]);
  const [legs, setLegs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [driverLocation, setDriverLocation] = useState({ latitude: 43.6532, longitude: -79.3832 }); // Default Toronto

  const requestPermissions = async () => {
    const res = await request(
      Platform.OS === 'ios' ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
    );
    if (res === RESULTS.GRANTED) {
      Geolocation.getCurrentPosition(
        (pos) => setDriverLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        (err) => console.log(err),
        { enableHighAccuracy: true }
      );
    }
  };

  useEffect(() => {
    requestPermissions();
    if (!user) return;
    
    // Subscribe to pending deliveries
    const unsubscribe = firestore()
      .collection('deliveries')
      .where('driverId', '==', user.uid)
      .where('status', '==', 'PENDING')
      .onSnapshot((snapshot) => {
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Delivery[];
        setDeliveries(docs);
        handleOptimization(docs);
      });

    return () => unsubscribe();
  }, [user]);

  const handleOptimization = async (stops: Delivery[]) => {
    if (stops.length === 0) {
      setOptimizedRoute([]);
      setPolyline([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const result = await optimizeRoute(
      { lat: driverLocation.latitude, lng: driverLocation.longitude },
      stops
      // process.env.GOOGLE_MAPS_API_KEY if needed
    );
    setOptimizedRoute(result.orderedStops);
    setLegs(result.legs);
    if (result.polyline) {
      setPolyline(decodePolyline(result.polyline));
    }
    setLoading(false);

    // Fit map
    setTimeout(() => {
      const coords = [{ latitude: driverLocation.latitude, longitude: driverLocation.longitude }, ...stops.map(s => ({ latitude: s.lat, longitude: s.lng }))];
      mapRef.current?.fitToCoordinates(coords, { edgePadding: { top: 50, right: 50, bottom: 50, left: 50 }, animated: true });
    }, 1000);
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await firestore().collection('deliveries').doc(id).update({ status });
    } catch (err) {
      Alert.alert("Error", "Could not update status.");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.mapContainer, { height: height * 0.45 }]}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            ...driverLocation,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          showsUserLocation
          mapPadding={{ top: insets.top, bottom: 0, left: 0, right: 0 }}
        >
          {optimizedRoute.map((stop, idx) => (
            <Marker
              key={stop.id}
              coordinate={{ latitude: stop.lat, longitude: stop.lng }}
              title={stop.customerName}
              pinColor={colors.primary}
            >
              <View style={[styles.markerBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.markerText}>{idx + 1}</Text>
              </View>
            </Marker>
          ))}
          {polyline.length > 0 && (
            <Polyline coordinates={polyline} strokeColor={colors.primary} strokeWidth={4} />
          )}
        </MapView>
      </View>

      <View style={[styles.listContainer, { flex: 1, backgroundColor: colors.background, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl }]}>
        <View style={styles.listHeader}>
          <Text style={[typography.h2, { color: colors.text.primary }]}>Optimized Route</Text>
          <Text style={[typography.caption, { color: colors.text.secondary }]}>{deliveries.length} Stops Remaining</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={optimizedRoute}
            keyExtractor={item => item.id}
            renderItem={({ item, index }) => (
              <RouteStopRow 
                stop={item} 
                index={index} 
                duration={legs[index]?.duration || 'N/A'} 
                onDelivered={(id) => updateStatus(id, 'DELIVERED')}
                onFailed={(id) => updateStatus(id, 'FAILED')}
              />
            )}
            contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom }]}
            ListEmptyComponent={() => (
              <View style={styles.empty}>
                <Text style={[typography.h3, { color: colors.text.secondary }]}>All deliveries completed! 🎉</Text>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  mapContainer: { width: '100%' },
  map: { ...StyleSheet.absoluteFillObject },
  listContainer: { marginTop: -20, padding: 20 },
  listHeader: { marginBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  listContent: { paddingBottom: 20 },
  markerBadge: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'white' },
  markerText: { color: 'white', fontWeight: 'bold' },
  empty: { flex: 1, alignItems: 'center', marginTop: 100 }
});

export default OptimisedRouteScreen;
