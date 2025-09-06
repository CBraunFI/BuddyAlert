// screens/AboutScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, typography, spacing } from '../styles/designSystem';

export default function AboutScreen() {
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[typography.h1, styles.title]}>Über BuddyAlert</Text>

      <Text style={[typography.body, styles.paragraph]}>
        BuddyAlert ist eine minimalistische Sicherheits‑App, entwickelt für
        Menschen, die aufeinander achten – schnell, anonym, effektiv. Kein Chat.
        Kein dauerhaftes Tracking. Kein Bullshit.
      </Text>

      <View style={styles.section}>
        <Text style={[typography.h2, styles.sectionTitle]}>Wie funktioniert’s?</Text>
        <Text style={typography.body}>
          Mit einem einzigen Tipp sendest du ein Signal an Menschen in deiner Nähe.
          Optional kannst du Vertrauenspersonen benachrichtigen – unabhängig davon,
          wo sie sich befinden.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[typography.h2, styles.sectionTitle]}>Warum BuddyAlert?</Text>
        <Text style={typography.body}>
          Weil Sicherheit kein Überwachungsproblem ist, sondern ein
          Solidaritätsversprechen. BuddyAlert schützt, ohne zu speichern – und
          verbindet, ohne zu kontrollieren. Privacy‑First ist Standard, nicht
          Zusatzoption.
        </Text>
      </View>

      <View style={styles.meta}>
        <Text style={typography.caption}>
          Version 1.0.0 • Entwickelt mit ❤️ von echten Menschen
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: colors.background,
  },
  title: {
    marginBottom: spacing.md,
    textAlign: 'left',
  },
  paragraph: {
    color: colors.text,
  },
  section: {
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  sectionTitle: {
    textAlign: 'left',
  },
  meta: {
    marginTop: spacing.xl,
    alignItems: 'flex-start',
  },
});
