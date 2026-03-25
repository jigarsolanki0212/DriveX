import React, { useEffect } from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/auth';

// Screens (will be created in next steps)
import LoginScreen from '../screens/LoginScreen';
import PhoneVerificationScreen from '../screens/PhoneVerificationScreen';
import DeliveriesScreen from '../screens/DeliveriesScreen';
import OptimisedRouteScreen from '../screens/OptimisedRouteScreen';
import { NotificationBanner } from '../components/NotificationBanner';

import { RootStackParamList } from './types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigate(name: keyof RootStackParamList, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name as any, params);
  }
}

const Stack = createNativeStackNavigator<RootStackParamList>();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="PhoneVerification" component={PhoneVerificationScreen} />
  </Stack.Navigator>
);

const AppStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Deliveries" component={DeliveriesScreen} />
    <Stack.Screen name="OptimisedRoute" component={OptimisedRouteScreen} />
  </Stack.Navigator>
);

export const RootNavigator = () => {
  const { user, isLoading, setUser } = useAuth();

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((u) => {
      setUser(u);
    });
    return unsubscribe;
  }, [setUser]);

  if (isLoading) {
    // Show splash/loading
    return null;
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <NotificationBanner />
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};
