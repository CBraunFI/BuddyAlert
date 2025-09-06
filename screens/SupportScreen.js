// screens/SupportScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking } from 'react-native';
import { colors, typography, spacing, radius, elevation } from '../styles/designSystem';

export default function SupportScreen() {
  const openMail = () => {
    // Falls ihr eine Support-Adresse habt, hier eintragen:
    const email = 'support@example.com'; // TODO: anpassen
    Linking.openURL(`mailto:${email}?subject=BuddyAlert%20Support`);
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={[typography.h1, styles.title]}>Support & Hilfe</Text>
      <Text style={[typography.body, styles.lead]}>
        Hier findest du bald Antworten auf häufige Fragen und Kontaktmöglichkeiten.
      </Text>

      <View style={[styles.card, elevation(2)]}>
        <Text style={[typography.h3, styles.cardTitle]}>FAQ (bald verfügbar)</Text>
        <View style={styles.list}>
          <Text style={styles.item}>• Wie löse ich einen Alarm aus?</Text>
          <Text style={styles.item}>• Was sehen andere über mich?</Text>
          <Text style={styles.item}>• Wie deaktiviere ich Benachrichtigungen?</Text>
        </View>
        <Text style={[typography.small, styles.note]}>
          Wir ergänzen die Inhalte Schritt für Schritt.
        </Text>
      </View>

      <View style={[styles.card, elevation(2)]}>
        <Text style={[typography.h3, styles.cardTitle]}>Kontakt</Text>
        <Text style={[typography.body, styles.text]}>
          Du hast eine Frage oder willst ein Problem melden? Schreib uns gern eine E‑Mail.
        </Text>
        <Text style={styles.link} onPress={openMail}>
          support@example.com
        </Text>
      </View>

      <View style={[styles.card, elevation(2)]}>
        <Text style={[typography.h3, styles.cardTitle]}>Wichtiger Hinweis</Text>
        <Text style={[typography.body, styles.text]}>
          BuddyAlert ist kein Ersatz für den Notruf. Bei unmittelbarer Gefahr wähle bitte die 112.
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
    gap: spacing.lg,
  },
  title: {
    marginBottom: spacing.xs,
  },
  lead: {
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  cardTitle: {
    marginBottom: spacing.sm,
  },
  list: {
    gap: 6,
    marginBottom: spacing.sm,
  },
  item: {
    ...typography.body,
    color: colors.text,
  },
  note: {
    color: colors.textSecondary,
  },
  text: {
    color: colors.text,
    marginBottom: spacing.sm,
  },
  link: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
});
