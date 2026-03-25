import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export type DeliveryStatus = 'PENDING' | 'IN_PROGRESS' | 'DELIVERED' | 'FAILED';

export interface Delivery {
  id: string;
  orderId: string;
  customerName: string;
  address: string;
  lat: number;
  lng: number;
  status: DeliveryStatus;
  driverId: string;
  createdAt: FirebaseFirestoreTypes.Timestamp;
}

export interface UserProfile {
  uid: string;
  email: string;
  phone: string;
  fcmToken: string;
  updatedAt: FirebaseFirestoreTypes.Timestamp;
}
