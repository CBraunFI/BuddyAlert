// screens/AlarmScreen.js
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Vibration,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { typography, spacing, colors } from '../styles/designSystem';
import { Ionicons } from '@expo/vector-icons';
// ⬇️ Button-Import erstmal auskommentiert, um Fehlerquelle zu testen
// import ButtonSecondary from '../components/atoms/ButtonSecondary';

export default function AlarmScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  // Params aus NotificationScreen
  const {
    alertId = 'simulated-alert',
    distanceM = null,
    sinceSec = null,
    lat = null,
    lng = null,
  } = route.params || {};

  // Kurzes Vibrationsfeedback beim Öffnen (nur nativ)
  useEffect(() => {
    if (Platform.OS !== 'web') {
      Vibration.vibrate(500);
    }
  }, []);

  // Dezente Puls-Animation für das Alert-Icon
  const scaleAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 700,
          easing: Easing.out(Easing.quad),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 700,
          easing: Easing.in(Easing.quad),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [scaleAnim]);

  const goHome = () => navigation.replace('HomeScreen');

  return (
    <View style={styles.container}>
      {/* Animiertes Icon */}
      <Animated.View
        style={[styles.iconWrapper, { transform: [{ scale: scaleAnim }] }]}
      >
        <Ionicons name="alert-circle" size={96} color="#fff" />
      </Animated.View>

      <Text style={styles.title}>Alarm wurde gesendet</Text>
      <Text style={styles.subtitle}>
        Dein Standort wurde temporär geteilt. Hilfe ist informiert.
      </Text>

      {/* Debug/Info-Bereich (nur DEV) */}
      {__DEV__ && (
        <View style={styles.debugBox}>
          <Text style={styles.debugText}>alertId: {alertId}</Text>
          {distanceM !== null && (
            <Text style={styles.debugText}>Entfernung: {distanceM} m</Text>
          )}
          {sinceSec !== null && (
            <Text style={styles.debugText}>Ausgelöst vor: {sinceSec} s</Text>
          )}
        </View>
      )}

      {/* Test-Element statt Button */}
      <Text style={styles.testText} onPress={goHome}>
        [Test] Zurück zur Startseite
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  iconWrapper: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: '#fff',
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: '#fff',
    textAlign: 'center',
    marginBottom: spacing.xl,
    opacity: 0.95,
  },
  testText: {
    marginTop: spacing.lg,
    color: '#fff',
    fontWeight: '700',
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 6,
  },
  debugBox: {
    marginVertical: spacing.lg,
    padding: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
  },
  debugText: {
    ...typography.small,
    color: '#fff',
  },
});
