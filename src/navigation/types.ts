export type RootStackParamList = {
  Login: undefined;
  PhoneVerification: { confirmation: any; phoneNumber: string };
  Deliveries: undefined;
  OptimisedRoute: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
