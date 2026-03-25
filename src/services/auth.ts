import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string;
  phone?: string;
  fcmToken?: string;
  updatedAt: any;
}

export const authService = {
  getCurrentUser: () => auth().currentUser,
  
  onAuthStateChanged: (callback: (user: FirebaseAuthTypes.User | null) => void) => {
    return auth().onAuthStateChanged(callback);
  },

  signInWithEmail: (email: string, pass: string) => {
    return auth().signInWithEmailAndPassword(email, pass);
  },

  signOut: () => auth().signOut(),

  verifyPhoneNumber: (phone: string) => {
    return auth().signInWithPhoneNumber(phone);
  },

  syncUserToFirestore: async (user: FirebaseAuthTypes.User) => {
    const userRef = firestore().collection('users').doc(user.uid);
    await userRef.set({
      uid: user.uid,
      email: user.email,
      phone: user.phoneNumber,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
  }
};
