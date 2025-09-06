// screens/OnboardingScreen.js
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, elevation } from '../styles/designSystem';

export default function OnboardingScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={[typography.h1, styles.title]}>
        Willkommen bei BuddyAlert
      </Text>

      <Text style={[typography.body, styles.subtitle]}>
        Dein solidarisches Sicherheitsnetz – minimalistisch, datensparsam und
        schnell.
      </Text>

      <TouchableOpacity
        accessibilityRole="button"
        style={[styles.button, elevation(2)]}
        onPress={() => navigation.replace('WelcomeScreen')}
      >
        <Text style={styles.buttonText}>Los geht’s</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: spacing.lg,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: spacing.xl,
    color: colors.textSecondary,
    paddingHorizontal: spacing.md,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 180,
  },
  buttonText: {
    ...typography.body,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
