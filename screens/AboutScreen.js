// screens/AboutScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, Pressable } from 'react-native';
import { colors, typography, spacing } from '../styles/designSystem';

export default function AboutScreen() {
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[typography.h1, styles.title]}>Über BuddyAlert</Text>

      <View style={styles.section}>
        <Text style={[typography.h2, styles.sectionTitle]}>
          Warum es BuddyAlert braucht
        </Text>
        <Text style={[typography.body, styles.paragraph]}>
          Du kennst diese leisen Momente – dunkle Wege, fremde Orte, das
          unbestimmte Unbehagen, dass etwas nicht stimmt. In solchen
          Augenblicken reicht ein Klick, und ein radiusbasiertes Netzwerk
          von Helfenden wird informiert. Keine Konfrontation, sondern Präsenz:
          beobachten, begleiten, ansprechen – einfach, solidarisch, menschlich.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[typography.h2, styles.sectionTitle]}>
          So funktioniert BuddyAlert
        </Text>
        <View style={styles.listItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={[typography.body, styles.listText]}>
            Alarm per App oder Lockscreen auslösen
          </Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={[typography.body, styles.listText]}>
            Nachricht an Helfende im Umkreis (~500 m); optional auch an
            persönliche Kontakte
          </Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={[typography.body, styles.listText]}>
            Unterstützung: vor Ort, per Anruf oder – nur wenn nötig – über
            offizielle Stellen
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[typography.h2, styles.sectionTitle]}>
          Datenschutz und Sicherheit an erster Stelle
        </Text>
        <View style={styles.listItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={[typography.body, styles.listText]}>
            Keine Standortverfolgung außerhalb eines Alarms
          </Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={[typography.body, styles.listText]}>
            Keine Speicherung personenbezogener Daten
          </Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={[typography.body, styles.listText]}>
            Ende-zu-Ende-verschlüsselte Übertragung
          </Text>
        </View>
        <Text style={[typography.body, styles.tagline]}>
          Privacy-First. Impact-Tech statt Überwachung.
        </Text>
      </View>

      <View style={styles.meta}>
        <Text style={typography.caption}>
          Version 1.0.0 • Entwickelt mit ❤️ von echten Menschen
        </Text>
        <Pressable onPress={() => Linking.openURL('https://www.ctnb.eu')}>
          <Text style={[typography.caption, styles.copyright]}>
            © ctnb 2025
          </Text>
        </Pressable>
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
    lineHeight: 24,
  },
  section: {
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  sectionTitle: {
    textAlign: 'left',
    marginBottom: spacing.sm,
  },
  listItem: {
    flexDirection: 'row',
    marginTop: spacing.xs,
    paddingRight: spacing.md,
  },
  bullet: {
    fontSize: 18,
    lineHeight: 24,
    marginRight: spacing.sm,
    color: colors.primary,
  },
  listText: {
    flex: 1,
    lineHeight: 24,
    color: colors.text,
  },
  tagline: {
    marginTop: spacing.md,
    fontStyle: 'italic',
    color: colors.primary,
  },
  meta: {
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.muted + '30',
    alignItems: 'flex-start',
  },
  copyright: {
    marginTop: spacing.sm,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
});
