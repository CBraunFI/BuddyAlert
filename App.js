import React, { useEffect, useCallback, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './navigation/AppNavigator';
import { initializeNotifications } from './utils/notificationHelper';
import { setAlarmNavigationRef } from './utils/alarmHelper';
import * as SplashScreen from 'expo-splash-screen';

import {
  useFonts,
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

// Splash-Screen blockieren, bis alles geladen ist
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    async function prepare() {
      try {
        initializeNotifications(); // z. B. Firebase init
      } catch (e) {
        console.warn('Fehler bei der Initialisierung:', e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady && fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady, fontsLoaded]);

  if (!appIsReady || !fontsLoaded) {
    return null;
  }

  return (
    <NavigationContainer
      onReady={onLayoutRootView}
      ref={(ref) => setAlarmNavigationRef(ref)}
    >
      <AppNavigator />
    </NavigationContainer>
  );
}
