import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import OneSignal from 'react-native-onesignal';
import Constants from 'expo-constants';
import AppNavigation from './navigation/AppNavigator';
import ErrorBoundary from './components/ErrorBoundary';
import { initializeNotifications } from './services/notifications';
import './i18n.config'; // Initialize i18n

const oneSignalAppId: string | undefined =
  (Constants as any)?.expoConfig?.extra?.oneSignalAppId ??
  (Constants as any)?.manifest?.extra?.oneSignalAppId;

export default function App() {
  useEffect(() => {
    // Initialize local notifications (for alarm alerts)
    initializeNotifications().catch((err) => {
      console.warn('Failed to initialize notifications:', err);
    });

    if (!oneSignalAppId) {
      console.warn('⚠️ OneSignal App ID fehlt (extra.oneSignalAppId).');
      return undefined;
    }

    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      // OneSignal v5 initialization (using 'as any' to bypass TypeScript errors)
      (OneSignal as any).initialize?.(oneSignalAppId);

      // Request permission for iOS
      (OneSignal as any).Notifications?.requestPermission?.(true);

      // Register click handler
      const onClick = (event: any) => {
        console.log('📩 Notification clicked:', event);
      };
      (OneSignal as any).Notifications?.addEventListener?.('click', onClick);

      // Cleanup on unmount
      return () => {
        (OneSignal as any).Notifications?.removeEventListener?.('click', onClick);
      };
    }
    return undefined;
  }, []);

  // Hier deine App zurückgeben
  return (
    <ErrorBoundary>
      <AppNavigation />
    </ErrorBoundary>
  );
}
