# DriveX - Production-Ready Driver Delivery App

Built with React Native 0.84, New Architecture (Fabric + TurboModules), and Firebase.

## Prerequisites
- Node 22.x+
- JDK 17
- Xcode 16+ (for iOS)
- Android Studio Ladybug+ (for Android 15 support)
- Firebase Account

## Getting Started

1. **Clone and Install**:
   ```bash
   npm install
   cd ios && bundle exec pod install
   ```

2. **Firebase Setup**:
   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com).
   - Enable **Auth** (Email/Password + Phone Verification).
   - Create a **Firestore** database.
   - Add an **Android App** and download `google-services.json` to `android/app/`.
   - Add an **iOS App** and download `GoogleService-Info.plist` to `ios/DriveXProject/`.

3. **Environment Configuration**:
   ```bash
   cp .env.example .env
   # Fill in your Firebase and Google Maps API keys
   ```

4. **Notifications Channel (Android)**:
   The app automatically creates the `deliveries` channel on startup.

5. **Running the App**:
   - Android: `npx react-native run-android`
   - iOS: `npx react-native run-ios`

6. **Cloud Functions**:
   ```bash
   cd functions
   npm install
   npm run build
   firebase deploy --only functions
   ```

## Troubleshooting
- Ensure **New Architecture** is enabled (it is by default in 0.84 but check `gradle.properties`).
- For **Location** issues, verify you've updated `Info.plist` and the Android Manifest (handled by `react-native-permissions`).
- **Google Maps**: Make sure the API key has the "Directions API" and "Maps SDK for Android/iOS" enabled.

## Security Rules (Firestore)
Apply these rules in the Firebase Console:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /deliveries/{docId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.driverId;
    }
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```
