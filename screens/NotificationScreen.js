// screens/NotificationScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, spacing, typography, radius } from '../styles/designSystem';
import { Card, MapStub, ButtonPrimary, ButtonSecondary } from '../components';

export default function NotificationScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  // Sichere Default-Parameter (falls keine übergeben werden, z. B. Simulation)
  const {
    alertId = 'simulated-alert',
    distanceM = 220,
    sinceSec = 45,
    lat = null,
    lng = null,
  } = route.params || {};

  // Helferfunktionen
  const formatDistance = (m) =>
    m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1)} km`;

  const formatTime = (sec) => {
    if (sec < 60) return `${sec} Sekunden`;
    const min = Math.floor(sec / 60);
    return `${min} Min${min > 1 ? '' : ''}`;
  };

  // Navigation-Handler
  const onHelp = () => {
    navigation.replace('AlarmScreen', { alertId, distanceM, sinceSec, lat, lng });
  };

  const onLater = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        {/* Header / Badge */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>BuddyAlert</Text>
        </View>

        <Text style={[typography.h2, styles.title]}>
          Eingehender Alarm in deiner Nähe
        </Text>
        <Text style={[typography.body, styles.subtitle]}>
          Jemand braucht Hilfe – du bist in Reichweite.
        </Text>

        {/* Kurzinfo-Row */}
        <View style={styles.infoRow}>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Entfernung</Text>
            <Text style={styles.infoValue}>{formatDistance(distanceM)}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Ausgelöst vor</Text>
            <Text style={styles.infoValue}>{formatTime(sinceSec)}</Text>
          </View>
        </View>

        {/* Map-Stub (später durch echte Karte ersetzbar) */}
        <MapStub />

        {/* Actions */}
        <View style={styles.actions}>
          <ButtonSecondary title="Später" onPress={onLater} />
          <ButtonPrimary title="Ich helfe" onPress={onHelp} />
        </View>

        {/* Hinweis */}
        <Text style={styles.note}>
          Deine genaue Position wird nur temporär genutzt und nicht dauerhaft
          gespeichert.
        </Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 560,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: spacing.sm,
  },
  badgeText: {
    ...typography.small,
    color: colors.primaryDark,
    fontWeight: '600',
  },
  title: {
    textAlign: 'left',
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  infoBox: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  infoLabel: {
    ...typography.small,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    ...typography.h3,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  note: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
