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
  Pressable,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { typography, spacing, colors } from '../styles/designSystem';
import { Ionicons } from '@expo/vector-icons';

export default function AlarmScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();

  // Params from alarm creation
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

      <Text style={styles.title}>{t('alarm.title')}</Text>
      <Text style={styles.subtitle}>
        {t('alarm.subtitle')}
      </Text>

      {/* Info box showing alert details */}
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>{t('alarm.alertId')}: {alertId}</Text>
        {lat !== null && lng !== null && (
          <Text style={styles.infoText}>
            Lat: {lat?.toFixed(6)}, Lng: {lng?.toFixed(6)}
          </Text>
        )}
        {distanceM !== null && (
          <Text style={styles.infoText}>
            {t('alarm.distance')}: {distanceM} {t('alarm.meters')}
          </Text>
        )}
        {sinceSec !== null && (
          <Text style={styles.infoText}>
            {t('alarm.triggeredAgo')}: {sinceSec} {t('alarm.seconds')}
          </Text>
        )}
      </View>

      <Pressable style={styles.button} onPress={goHome}>
        <Text style={styles.buttonText}>{t('alarm.backToHome')}</Text>
      </Pressable>
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
  button: {
    marginTop: spacing.xl,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fff',
  },
  buttonText: {
    ...typography.h3,
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
  },
  infoBox: {
    marginVertical: spacing.lg,
    padding: spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    width: '100%',
  },
  infoText: {
    ...typography.body,
    color: '#fff',
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
});
