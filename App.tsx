import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import OneSignal from 'react-native-onesignal';
import Constants from 'expo-constants';
import AppNavigation from './navigation/AppNavigator';
import ErrorBoundary from './components/ErrorBoundary';

const oneSignalAppId: string | undefined =
  (Constants?.expoConfig?.extra as any)?.oneSignalAppId ??
  (Constants?.manifest?.extra as any)?.oneSignalAppId;

export default function App() {
  useEffect(() => {
    if (!oneSignalAppId) {
      console.warn('⚠️ OneSignal App ID fehlt (extra.oneSignalAppId).');
      return;
    }

    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      // OneSignal v5 Initialisierung
      OneSignal.initialize(oneSignalAppId);

      // iOS: nach Berechtigung fragen
      OneSignal.Notifications.requestPermission(true);

      // Klick-Handler registrieren
      const onClick = (event: any) => {
        console.log('📩 Notification geklickt:', event);
        // hier kannst du Navigation oder State-Updates einfügen
      };
      OneSignal.Notifications.addEventListener('click', onClick);

      // Cleanup bei Unmount
      return () => {
        OneSignal.Notifications.removeEventListener('click', onClick);
      };
    }
  }, []);

  // Hier deine App zurückgeben
  return (
    <ErrorBoundary>
      <AppNavigation />
    </ErrorBoundary>
  );
}
