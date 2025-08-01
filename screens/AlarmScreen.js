import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Vibration,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { typography, spacing, colors } from '../styles/designSystem';
import { Ionicons } from '@expo/vector-icons';

export default function AlarmScreen() {
  const navigation = useNavigation();

  // Vibrieren beim Öffnen (nur auf nativ)
  useEffect(() => {
    if (Platform.OS !== 'web') {
      Vibration.vibrate(500);
    }
  }, []);

  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
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
    ).start();
  }, [scaleAnim]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.iconWrapper, { transform: [{ scale: scaleAnim }] }]}>
        <Ionicons name="alert-circle" size={96} color="#fff" />
      </Animated.View>

      <Text style={styles.title}>Alarm wurde gesendet</Text>
      <Text style={styles.subtitle}>Dein Standort wurde geteilt. Hilfe ist informiert.</Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.buttonText}>Zurück zur Startseite</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary || '#4D5DFF',
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
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 100,
  },
  buttonText: {
    color: colors.primary || '#4D5DFF',
    ...typography.button,
  },
});
