import { Delivery } from '../types';

export interface RouteLeg {
  distance: string;
  duration: string;
}

export interface OptimizedRoute {
  orderedStops: Delivery[];
  legs: RouteLeg[];
  polyline: string;
}

/**
 * Decodes Google Maps Encoded Polyline
 */
export const decodePolyline = (encoded: string) => {
  const points = [];
  let index = 0, len = encoded.length;
  let lat = 0, lng = 0;

  while (index < len) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }
  return points;
};

/**
 * Greedy Nearest Neighbor Fallback
 */
const greedyOptimize = (origin: { lat: number, lng: number }, stops: Delivery[]): Delivery[] => {
  const result: Delivery[] = [];
  let currentPos = origin;
  const remaining = [...stops];

  while (remaining.length > 0) {
    let closestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const d = Math.sqrt(
        Math.pow(remaining[i].lat - currentPos.lat, 2) + 
        Math.pow(remaining[i].lng - currentPos.lng, 2)
      );
      if (d < minDistance) {
        minDistance = d;
        closestIndex = i;
      }
    }

    const nextStop = remaining.splice(closestIndex, 1)[0];
    result.push(nextStop);
    currentPos = { lat: nextStop.lat, lng: nextStop.lng };
  }

  return result;
};

export const optimizeRoute = async (
  driverLocation: { lat: number, lng: number },
  stops: Delivery[],
  apiKey?: string
): Promise<OptimizedRoute> => {
  if (!apiKey || stops.length === 0) {
    return {
      orderedStops: greedyOptimize(driverLocation, stops),
      legs: stops.map(() => ({ distance: 'Unknown', duration: 'Unknown' })),
      polyline: '',
    };
  }

  try {
    const origin = `${driverLocation.lat},${driverLocation.lng}`;
    const destination = `${stops[stops.length - 1].lat},${stops[stops.length - 1].lng}`;
    const waypoints = stops.slice(0, -1).map(s => `${s.lat},${s.lng}`).join('|');
    
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&waypoints=optimize:true|${waypoints}&mode=driving&key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error(data.error_message || 'API Error');
    }

    const route = data.routes[0];
    const waypointOrder = route.waypoint_order as number[];
    
    // waypoints order is 0-based for the list we passed
    // Reorder original stops (excluding the destination which is the last)
    const middleStops = stops.slice(0, -1);
    const orderedStops = waypointOrder.map(idx => middleStops[idx]);
    orderedStops.push(stops[stops.length - 1]); // Add the destination back

    return {
      orderedStops,
      legs: route.legs.map((l: any) => ({ distance: l.distance.text, duration: l.duration.text })),
      polyline: route.overview_polyline.points,
    };
  } catch (error) {
    console.warn('Optimization API failed, using greedy fallback:', error);
    return {
      orderedStops: greedyOptimize(driverLocation, stops),
      legs: stops.map(() => ({ distance: 'N/A', duration: 'N/A' })),
      polyline: '',
    };
  }
};
