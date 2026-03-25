import messaging from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';
import { navigate } from '../navigation/RootNavigator';

export const setupFCM = async (uid: string) => {
  // Request permission
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    const token = await messaging().getToken();
    await saveTokenToFirestore(uid, token);
  }

  // Listen for refreshes
  messaging().onTokenRefresh(token => {
    saveTokenToFirestore(uid, token);
  });

  // Handle Foreground
  const unsubscribe = messaging().onMessage(async remoteMessage => {
    console.log('FCM Message received in foreground:', remoteMessage);
    // User wants custom Banner here, but for now we log.
    // I'll implement NotificationBanner later.
  });

  // Handle Background click
  messaging().onNotificationOpenedApp(remoteMessage => {
    navigate('Deliveries');
  });

  // Handle Killed State click
  messaging().getInitialNotification().then(remoteMessage => {
    if (remoteMessage) {
      navigate('Deliveries');
    }
  });

  return unsubscribe;
};

const saveTokenToFirestore = async (uid: string, token: string) => {
  await firestore().collection('users').doc(uid).set({
    fcmToken: token,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
};
