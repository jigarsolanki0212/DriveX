import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import { initializeApp } from 'firebase-admin/app';

initializeApp();

export const onNewDelivery = onDocumentCreated(
  'deliveries/{docId}',
  async (event) => {
    const data = event.data?.data();
    if (!data) return;

    const { driverId, orderId, customerName, address } = data as any;
    
    // Fetch driver FCM token
    const userDoc = await getFirestore()
      .collection('users')
      .doc(driverId)
      .get();

    const fcmToken = userDoc.data()?.fcmToken;
    if (!fcmToken) {
      console.log('No FCM token for driver:', driverId);
      return;
    }

    try {
      await getMessaging().send({
        token: fcmToken,
        notification: {
          title: 'New Delivery Assigned 🚚',
          body: `Order ${orderId} • ${customerName} • ${address}`
        },
        data: {
          screen: 'Deliveries',
          orderId,
          docId: event.params.docId
        },
        android: {
          priority: 'high',
          notification: {
            channelId: 'deliveries',
            sound: 'default',
            priority: 'max',
            defaultVibrateTimings: true
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
              contentAvailable: true
            }
          },
          headers: {
            'apns-priority': '10'
          }
        }
      });
      console.log('Successfully sent notification to driver:', driverId);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }
);
