// screens/SettingsScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, typography, radius, elevation } from '../styles/designSystem';
import { ButtonPrimary, ButtonSecondary } from '../components';

export default function SettingsScreen() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [onlyVerifiedBuddies, setOnlyVerifiedBuddies] = useState(false);
  const [loading, setLoading] = useState(true);

  // Keys
  const KEY_AVAIL = 'availability';
  const KEY_VERIFIED = 'isVerified';
  const KEY_ONLY_VERIFIED = 'onlyVerifiedBuddies';

  // Initial laden
  useEffect(() => {
    (async () => {
      try {
        const [avail, verified, onlyV] = await Promise.all([
          AsyncStorage.getItem(KEY_AVAIL),
          AsyncStorage.getItem(KEY_VERIFIED),
          AsyncStorage.getItem(KEY_ONLY_VERIFIED),
        ]);
        if (avail !== null) setIsAvailable(JSON.parse(avail));
        if (verified !== null) setIsVerified(JSON.parse(verified));
        if (onlyV !== null) setOnlyVerifiedBuddies(JSON.parse(onlyV));
      } catch (e) {
        console.error('Fehler beim Laden der Einstellungen', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Toggles + Persistenz
  const toggleAvailability = useCallback(async () => {
    const next = !isAvailable;
    setIsAvailable(next);
    try {
      await AsyncStorage.setItem(KEY_AVAIL, JSON.stringify(next));
    } catch (e) {
      console.error('Fehler beim Speichern des Bereitschaftsstatus', e);
    }
  }, [isAvailable]);

  const startVerification = useCallback(async () => {
    // Placeholder: Hier könntet ihr z. B. Kamera/ID-Flow starten oder API anstoßen.
    // Für MVP simulieren wir eine erfolgreiche Verifizierung.
    const next = true;
    setIsVerified(next);
    try {
      await AsyncStorage.setItem(KEY_VERIFIED, JSON.stringify(next));
    } catch (e) {
      console.error('Fehler beim Speichern der Verifizierung', e);
    }
  }, []);

  const revokeVerification = useCallback(async () => {
    setIsVerified(false);
    setOnlyVerifiedBuddies(false);
    try {
      await AsyncStorage.multiSet([
        [KEY_VERIFIED, JSON.stringify(false)],
        [KEY_ONLY_VERIFIED, JSON.stringify(false)],
      ]);
    } catch (e) {
      console.error('Fehler beim Zurücksetzen der Verifizierung', e);
    }
  }, []);

  const toggleOnlyVerified = useCallback(async () => {
    if (!isVerified) return; // Guard
    const next = !onlyVerifiedBuddies;
    setOnlyVerifiedBuddies(next);
    try {
      await AsyncStorage.setItem(KEY_ONLY_VERIFIED, JSON.stringify(next));
    } catch (e) {
      console.error('Fehler beim Speichern der Buddy-Filtereinstellung', e);
    }
  }, [onlyVerifiedBuddies, isVerified]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={typography.body}>Lade Einstellungen…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[typography.h1, styles.title]}>Einstellungen</Text>

      {/* Bereitschaft */}
      <View style={[styles.card, elevation(2)]}>
        <Text style={[typography.h3, styles.cardTitle]}>Bereitschaft</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Ich bin verfügbar für BuddyAlerts</Text>
          <Switch value={isAvailable} onValueChange={toggleAvailability} />
        </View>
        {isAvailable ? (
          <Text style={styles.infoPositive}>Du bist Teil des aktiven Sicherheitsnetzes.</Text>
        ) : (
          <Text style={styles.infoNeutral}>Du erhältst aktuell keine Anfragen aus der Nähe.</Text>
        )}
      </View>

      {/* Verifizierung */}
      <View style={[styles.card, elevation(2)]}>
        <Text style={[typography.h3, styles.cardTitle]}>Verifizierung</Text>

        <View style={styles.rowSpace}>
          <Text style={styles.label}>
            Status: <Text style={{ fontWeight: '700' }}>{isVerified ? 'Verifiziert' : 'Nicht verifiziert'}</Text>
          </Text>
          {isVerified ? (
            <ButtonSecondary title="Verifizierung entfernen" onPress={revokeVerification} />
          ) : (
            <ButtonPrimary title="Jetzt verifizieren" onPress={startVerification} />
          )}
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Nur verifizierte Buddys alarmieren</Text>
          <Switch
            value={!!onlyVerifiedBuddies}
            onValueChange={toggleOnlyVerified}
            disabled={!isVerified}
          />
        </View>
        {!isVerified ? (
          <Text style={styles.infoNeutral}>
            Aktiviere zuerst die Verifizierung, um nur verifizierte Buddys zu alarmieren.
          </Text>
        ) : onlyVerifiedBuddies ? (
          <Text style={styles.infoPositive}>
            Dein Alarm geht ausschließlich an verifizierte Helfer:innen.
          </Text>
        ) : (
          <Text style={styles.infoNeutral}>
            Dein Alarm kann alle erreichbaren Helfer:innen erreichen (verifiziert & nicht verifiziert).
          </Text>
        )}
      </View>

      {/* Datenschutz-Hinweis */}
      <View style={[styles.card, elevation(1)]}>
        <Text style={[typography.h3, styles.cardTitle]}>Datenschutz</Text>
        <Text style={styles.text}>
          Verifizierung ist freiwillig. Daten werden minimal gespeichert und können jederzeit
          zurückgesetzt werden. Bei akuter Gefahr wähle bitte die 112.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  title: {
    marginBottom: spacing.xs,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardTitle: {
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowSpace: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  label: {
    ...typography.body,
    color: colors.text,
    flexShrink: 1,
    paddingRight: spacing.md,
  },
  infoPositive: {
    ...typography.small,
    color: colors.success,
  },
  infoNeutral: {
    ...typography.small,
    color: colors.textSecondary,
  },
  text: {
    ...typography.body,
    color: colors.text,
  },
});
