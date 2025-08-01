// screens/LegalScreen.js

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking } from 'react-native';
import { colors, typography, spacing } from '../styles/designSystem';

export default function LegalScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={typography.h1}>Rechtliches</Text>

      <View style={styles.section}>
        <Text style={typography.h2}>Impressum</Text>
        <Text style={typography.body}>
          Verantwortlich für diese App:{'\n'}
          Christophe Braun{'\n'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={typography.h2}>Datenschutz</Text>
        <Text style={typography.body}>
          BuddyAlert speichert keine personenbezogenen Daten dauerhaft. Standortinformationen werden nur temporär und anonymisiert verarbeitet, um Notfallbenachrichtigungen im Umkreis zu ermöglichen.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={typography.h2}>Kontakt</Text>
        <Text
          style={[typography.body, styles.link]}
          onPress={() => Linking.openURL('mailto:kontakt@buddyalert.app')}
        >
          kontakt@buddyalert.app
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={typography.caption}>Letzte Aktualisierung: Juli 2025</Text>
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
  link: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
});
