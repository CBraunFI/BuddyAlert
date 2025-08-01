// screens/AboutScreen.js

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, typography, spacing } from '../styles/designSystem';

export default function AboutScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={typography.h1}>Über BuddyAlert</Text>
      <Text style={typography.body}>
        BuddyAlert ist eine minimalistische Sicherheits-App, entwickelt für Menschen, die aufeinander achten – schnell, anonym, effektiv. Kein Chat. Kein Tracking. Kein Bullshit.
      </Text>

      <View style={styles.section}>
        <Text style={typography.h2}>Wie funktioniert’s?</Text>
        <Text style={typography.body}>
          Mit einem einzigen Klick sendest du ein Signal an Menschen in deiner Nähe. Du kannst auch Vertrauenspersonen benachrichtigen – egal, wo sie gerade sind.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={typography.h2}>Warum BuddyAlert?</Text>
        <Text style={typography.body}>
          Weil Sicherheit kein Überwachungsproblem ist, sondern ein Solidaritätsversprechen. Unsere App schützt, ohne zu speichern. Sie verbindet, ohne zu kontrollieren.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={typography.caption}>Version 1.0.0 • Entwickelt mit ❤️ von echten Menschen</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  section: {
    marginTop: spacing.xl,
  },
});
