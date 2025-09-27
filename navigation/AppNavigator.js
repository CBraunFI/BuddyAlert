import React, { lazy, Suspense } from 'react';
import { Platform, View, Text, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors, typography } from '../styles/designSystem';

// Core screens - loaded immediately
import SplashScreen from '../screens/SplashScreen';
import HomeScreen from '../screens/HomeScreen';

// Lazy loaded screens for better initial load performance
const WelcomeScreen = lazy(() => import('../screens/WelcomeScreen'));
const OnboardingScreen = lazy(() => import('../screens/OnboardingScreen'));
const AlarmScreen = lazy(() => import('../screens/AlarmScreen'));
const NotificationScreen = lazy(() => import('../screens/NotificationScreen'));
const SettingsScreen = lazy(() => import('../screens/SettingsScreen'));
const SupportScreen = lazy(() => import('../screens/SupportScreen'));
const LegalScreen = lazy(() => import('../screens/LegalScreen'));
const AboutScreen = lazy(() => import('../screens/AboutScreen'));

// Loading component for lazy-loaded screens
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <Text style={styles.loadingText}>Loading...</Text>
  </View>
);

// Wrapper component for lazy-loaded screens
const LazyScreenWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingScreen />}>
    {children}
  </Suspense>
);

const Stack = createNativeStackNavigator();
const isWeb = Platform.OS === 'web';

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="SplashScreen"
      screenOptions={{
        // Web-spezifische Robustheit
        animation: isWeb ? 'none' : 'default',
        gestureEnabled: !isWeb,
        fullScreenGestureEnabled: !isWeb,
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="SplashScreen"
        component={SplashScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="WelcomeScreen"
        options={{ headerShown: false }}
      >
        {(props) => (
          <LazyScreenWrapper>
            <WelcomeScreen {...props} />
          </LazyScreenWrapper>
        )}
      </Stack.Screen>
      <Stack.Screen
        name="OnboardingScreen"
        options={{ headerShown: false }}
      >
        {(props) => (
          <LazyScreenWrapper>
            <OnboardingScreen {...props} />
          </LazyScreenWrapper>
        )}
      </Stack.Screen>
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AlarmScreen"
        options={{ headerShown: false }}
      >
        {(props) => (
          <LazyScreenWrapper>
            <AlarmScreen {...props} />
          </LazyScreenWrapper>
        )}
      </Stack.Screen>
      <Stack.Screen
        name="NotificationScreen"
        options={{ headerShown: false }}
      >
        {(props) => (
          <LazyScreenWrapper>
            <NotificationScreen {...props} />
          </LazyScreenWrapper>
        )}
      </Stack.Screen>
      <Stack.Screen name="SettingsScreen">
        {(props) => (
          <LazyScreenWrapper>
            <SettingsScreen {...props} />
          </LazyScreenWrapper>
        )}
      </Stack.Screen>
      <Stack.Screen name="SupportScreen">
        {(props) => (
          <LazyScreenWrapper>
            <SupportScreen {...props} />
          </LazyScreenWrapper>
        )}
      </Stack.Screen>
      <Stack.Screen name="LegalScreen">
        {(props) => (
          <LazyScreenWrapper>
            <LegalScreen {...props} />
          </LazyScreenWrapper>
        )}
      </Stack.Screen>
      <Stack.Screen name="AboutScreen">
        {(props) => (
          <LazyScreenWrapper>
            <AboutScreen {...props} />
          </LazyScreenWrapper>
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    ...typography.body,
    color: colors.muted,
  },
});
