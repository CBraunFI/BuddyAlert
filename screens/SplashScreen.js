// screens/SplashScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, typography } from '../styles/designSystem';

export default function SplashScreen({ navigation }) {
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    let timer;
    (async () => {
      try {
        const [seenSplash, hasOnboarded] = await Promise.all([
          AsyncStorage.getItem('hasSeenSplash'),
          AsyncStorage.getItem('hasOnboarded'),
        ]);

        // Wenn Splash schon mal gezeigt wurde -> sofort weiter
        if (seenSplash === 'true') {
          if (hasOnboarded === 'true') {
            navigation.replace('WelcomeScreen');
          } else {
            navigation.replace('OnboardingScreen');
          }
          return;
        }

        // Erstes App-Start: Splash kurz zeigen, dann Flag setzen & weiter
        setShowSplash(true);
        timer = setTimeout(async () => {
          try {
            await AsyncStorage.setItem('hasSeenSplash', 'true');
          } catch {}
          navigation.replace('OnboardingScreen');
        }, 1500);
      } catch (e) {
        // Im Fehlerfall lieber schnell weiter (Fail-open)
        navigation.replace('OnboardingScreen');
      }
    })();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [navigation]);

  // Kein Splash zeigen? Dann gar nichts rendern (vermeidet Flackern)
  if (!showSplash) return null;

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={[typography.h1, styles.title]}>BuddyAlert</Text>
      <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: spacing.md,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  loader: {
    marginTop: spacing.md,
  },
});
