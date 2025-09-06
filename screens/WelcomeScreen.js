import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { typography, colors, spacing } from '../styles/designSystem';
import { useNavigation } from '@react-navigation/native';
import { ButtonPrimary } from '../components';

export default function WelcomeScreen() {
  const navigation = useNavigation();

  const goHome = () => navigation.navigate('HomeScreen');
  const goAbout = () => navigation.navigate('AboutScreen');

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={[typography.h1, styles.title]}>BuddyAlert</Text>

      <Text style={[typography.body, styles.teaser]}>
        Dein solidarisches Sicherheitsnetz in der Nähe.
      </Text>

      <ButtonPrimary
        title="Alarm auslösen"
        onPress={goHome}
        accessibilityLabel="Alarm auslösen"
        style={styles.cta}
      />

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Mehr über BuddyAlert erfahren"
        style={styles.linkButton}
        onPress={goAbout}
      >
        <Text style={styles.linkText}>Mehr erfahren</Text>
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
    paddingHorizontal: spacing.lg,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: spacing.lg,
  },
  title: {
    textAlign: 'center',
  },
  teaser: {
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    color: colors.textSecondary,
  },
  cta: {
    width: '100%',
    marginBottom: spacing.md,
  },
  linkButton: {
    padding: spacing.sm,
  },
  linkText: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '600',
  },
});
