// screens/HomeScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Alert as RNAlert, StyleSheet, Platform } from 'react-native';
import { colors, typography } from '../styles/designSystem'; // ggf. Pfad anpassen
import { createAlert, getFallbackPosition, VISIBILITY, subscribeRecentAlerts } from '../services/alerts';
import { getCurrentPositionSafe } from '../services/location';
import MapShim from '../components/MapShim';

export default function HomeScreen({ navigation }) {
  const [isSending, setIsSending] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [initialRegion, setInitialRegion] = useState(null);

  // Live-Alerts laden (neueste zuerst)
  useEffect(() => {
    const unsub = subscribeRecentAlerts((docs) => {
      setAlerts(docs);
      // initiale Kartenregion setzen (1x), wenn noch keine da ist
      if (!initialRegion) {
        const first = docs[0];
        if (first?.lat && first?.lng) {
          setInitialRegion({
            latitude: first.lat,
            longitude: first.lng,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          });
        }
      }
    });
    return () => unsub && unsub();
  }, [initialRegion]);

  // Fallback-Region, falls noch keine Alerts existieren
  useEffect(() => {
    (async () => {
      if (!initialRegion) {
        const { lat, lng } = await getFallbackPosition();
        setInitialRegion({
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        });
      }
    })();
  }, [initialRegion]);

  const onPressTriggerAlert = async ({ useVerified = false } = {}) => {
    try {
      setIsSending(true);

      // 1) Echte Position versuchen, sonst Fallback + Nutzerhinweis
      let coords;
      try {
        coords = await getCurrentPositionSafe({ timeoutMs: 8000 });
      } catch (locErr) {
        console.warn('Geo fehlgeschlagen, nutze Fallback:', locErr?.message);
        RNAlert.alert(
          'Hinweis',
          `Echte Position nicht verfügbar (${locErr?.message}). Nutze Fallback-Koordinaten.`
        );
        coords = await getFallbackPosition();
      }

      // 2) Alert anlegen
      const id = await createAlert({
        lat: coords.lat,
        lng: coords.lng,
        visibility: useVerified ? VISIBILITY.VERIFIED : VISIBILITY.PUBLIC,
      });

      // 3) Erfolgsmeldung
      RNAlert.alert('Alarm gesendet', `Alert-ID: ${id}`);
    } catch (e) {
      console.error('Alert fehlgeschlagen', e);
      RNAlert.alert('Fehler', e?.message ?? 'Der Alarm konnte nicht gesendet werden.');
    } finally {
      setIsSending(false);
    }
  };

  const onSeedFakeAlerts = async () => {
    try {
      setIsSending(true);
      const { addFakeAlerts } = await import('../services/alerts');
      await addFakeAlerts();
      RNAlert.alert('Seeding', '3 Fake-Alerts wurden angelegt.');
    } catch (e) {
      console.error('Seeding fehlgeschlagen', e);
      RNAlert.alert('Fehler beim Seeden', e?.message ?? 'Unbekannter Fehler');
    } finally {
      setIsSending(false);
    }
  };

  const onRequestWebPushPermission = async () => {
    try {
      const { requestWebPushPermission } = await import('../utils/onesignalWeb');
      requestWebPushPermission();
    } catch (e) {
      console.error('Web Push Prompt fehlgeschlagen', e);
      RNAlert.alert('Hinweis', 'Konnte den Web-Push-Prompt nicht öffnen.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={typography.h1}>BuddyAlert</Text>
      <Text style={[styles.subtitle, typography.h3]}>
        Drücke einen Button, um einen Alarm zu erstellen.
      </Text>

      <View style={styles.btnGroup}>
        <Pressable
          disabled={isSending}
          onPress={() => onPressTriggerAlert({ useVerified: false })}
          style={[
            styles.button,
            styles.primary,
            isSending && styles.disabled,
          ]}
        >
          <Text style={styles.buttonText}>
            {isSending ? 'Sende…' : 'Alarm auslösen (öffentlich)'}
          </Text>
        </Pressable>

        <Pressable
          disabled={isSending}
          onPress={() => onPressTriggerAlert({ useVerified: true })}
          style={[
            styles.button,
            styles.secondary,
            isSending && styles.disabled,
          ]}
        >
          <Text style={styles.buttonText}>
            {isSending ? 'Sende…' : 'Alarm auslösen (nur verifiziert)'}
          </Text>
        </Pressable>
      </View>

      {/* Map-Bereich (MapShim löst plattformspezifisch auf:
          - native: echte Karte mit Pins
          - web: Platzhalter ohne native Module)
      */}
      <View style={styles.mapContainer}>
        {initialRegion ? (
          <MapShim region={initialRegion} alerts={alerts} />
        ) : (
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapPlaceholderText}>Lade Karte…</Text>
          </View>
        )}
      </View>

      {/* Dev-Helfer (optional): Fake-Alerts anlegen */}
      <Pressable
        disabled={isSending}
        onPress={onSeedFakeAlerts}
        style={[
          styles.button,
          styles.alert,
          isSending && styles.disabled,
          { marginTop: 16 },
        ]}
      >
        <Text style={[styles.buttonText, { color: colors.onAlert }]}>
          {isSending ? 'Seede…' : 'Fake-Alerts anlegen (Dev)'}
        </Text>
      </Pressable>

      {/* Web: OneSignal-Prompt auslösen */}
      {Platform.OS === 'web' && (
        <Pressable
          onPress={onRequestWebPushPermission}
          style={[
            styles.button,
            styles.secondary,
            { marginTop: 12 },
          ]}
        >
          <Text style={styles.buttonText}>
            Browser-Benachrichtigungen aktivieren
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  subtitle: {
    color: colors.muted,
    marginTop: 6,
  },
  btnGroup: {
    marginTop: 20,
    gap: 8, // falls RN-Version kein 'gap' kennt: entfernen + dem ersten Button marginBottom: 8 geben
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    ...typography.h3,
    color: '#fff',
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
  alert: {
    backgroundColor: colors.alert,
  },
  disabled: {
    opacity: 0.6,
  },
  mapContainer: {
    marginTop: 16,
    height: 260,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e5e5e5',
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPlaceholderText: {
    textAlign: 'center',
    color: colors.muted,
  },
});
