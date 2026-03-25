import { create } from 'zustand';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { authService } from '../services/auth';

interface AuthState {
  user: FirebaseAuthTypes.User | null;
  isLoading: boolean;
  isPhoneVerified: boolean;
  setUser: (user: FirebaseAuthTypes.User | null) => void;
  setLoading: (loading: boolean) => void;
  setPhoneVerified: (verified: boolean) => void;
  signOut: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isPhoneVerified: false,
  setUser: (user) => set({ user, isLoading: false, isPhoneVerified: !!user?.phoneNumber }),
  setLoading: (isLoading) => set({ isLoading }),
  setPhoneVerified: (isPhoneVerified) => set({ isPhoneVerified }),
  signOut: async () => {
    await authService.signOut();
    set({ user: null, isPhoneVerified: false });
  },
}));
