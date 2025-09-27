// screens/HomeScreen.js
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  Alert as RNAlert,
  StyleSheet,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, typography } from '../styles/designSystem'; // ggf. Pfad anpassen
import {
  createAlert,
  getFallbackPosition,
  VISIBILITY,
  subscribeRecentAlerts,
} from '../services/alerts';
import {
  getCurrentPositionSafe,
  watchPositionSafe,
} from '../services/location';
import { getUid } from '../services/identity';
import { setUserLastLocation } from '../services/users';
import MapShim from '../components/MapShim';

export default function HomeScreen({ navigation }) {
  const [isSending, setIsSending] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [initialRegion, setInitialRegion] = useState(null);

  // Block 1: Bereitschaft + Location-Watching
  const [isAvailable, setIsAvailable] = useState(false);
  const [watching, setWatching] = useState(false);
  const watchHandleRef = useRef(null);
  const [lastLocation, setLastLocation] = useState(null);

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

  // Bereitschaft aus Storage laden
  useEffect(() => {
    (async () => {
      try {
        const value = await AsyncStorage.getItem('availability');
        if (value !== null) setIsAvailable(!!JSON.parse(value));
      } catch {
        // schweigend ignorieren
      }
    })();
  }, []);

  // Watch steuern: in Bereitschaft tracken, sonst stoppen
  useEffect(() => {
    if (isAvailable) {
      startWatching();
    } else {
      stopWatching();
    }
    return stopWatching; // Cleanup beim Unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAvailable]);

  async function startWatching() {
    if (watching) return;
    try {
      const handle = await watchPositionSafe(async (pos) => {
        setLastLocation(pos);
        // Optional: initiale Region beim ersten Fix setzen
        if (!initialRegion && pos?.lat && pos?.lng) {
          setInitialRegion((prev) => {
            if (prev) return prev;
            return {
              latitude: pos.lat,
              longitude: pos.lng,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            };
          });
        }
        // NEU: lastLocation in Firestore persistieren
        try {
          const uid = await getUid();
          await setUserLastLocation(uid, pos);
        } catch (e) {
          console.warn('setUserLastLocation fehlgeschlagen:', e?.message);
        }
      });
      watchHandleRef.current = handle;
      setWatching(true);
    } catch (err) {
      console.warn('[watchPositionSafe] Fehler:', err?.message);
      RNAlert.alert(
        'Standort',
        'Konnte Standort-Tracking nicht starten. Prüfe Berechtigungen & GPS.'
      );
      setWatching(false);
    }
  }

  function stopWatching() {
    try {
      watchHandleRef.current?.stop?.();
    } catch {}
    watchHandleRef.current = null;
    setWatching(false);
  }

  const onToggleAvailability = useCallback(async () => {
    const next = !isAvailable;
    setIsAvailable(next);
    try {
      await AsyncStorage.setItem('availability', JSON.stringify(next));
    } catch {}
  }, [isAvailable]);

  const onPressTriggerAlert = useCallback(async ({ useVerified = false } = {}) => {
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
      RNAlert.alert(
        'Fehler',
        e?.message ?? 'Der Alarm konnte nicht gesendet werden.'
      );
    } finally {
      setIsSending(false);
    }
  }, []);

  const onSeedFakeAlerts = useCallback(async () => {
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
  }, []);

  const onRequestWebPushPermission = async () => {
    try {
      const { requestWebPushPermission } = await import('../utils/onesignalWeb');
      requestWebPushPermission();
    } catch (e) {
      console.error('Web Push Prompt fehlgeschlagen', e);
      RNAlert.alert('Hinweis', 'Konnte den Web-Push-Prompt nicht öffnen.');
    }
  };

  const onTestLocation = async () => {
    try {
      const pos = await getCurrentPositionSafe({ timeoutMs: 8000 });
      setLastLocation(pos);
      if (!initialRegion && pos?.lat && pos?.lng) {
        setInitialRegion({
          latitude: pos.lat,
          longitude: pos.lng,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        });
      }
      RNAlert.alert(
        'Standort ermittelt',
        `Lat: ${pos.lat?.toFixed(5)}, Lng: ${pos.lng?.toFixed(5)}\nGenauigkeit: ${Math.round(
          pos.accuracy || 0
        )} m`
      );
    } catch (e) {
      RNAlert.alert(
        'Fehler',
        e?.message ?? 'Standort konnte nicht ermittelt werden.'
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={typography.h1}>BuddyAlert</Text>

      {/* Bereitschaft + Debug */}
      <View style={styles.inlineRow}>
        <Text style={[styles.subtitle, typography.h3]}>
          Drücke einen Button, um einen Alarm zu erstellen.
        </Text>
      </View>

      <View style={styles.statusCard}>
        <Text style={styles.label}>Bereitschaft:</Text>
        <Pressable
          onPress={onToggleAvailability}
          style={[
            styles.badge,
            { backgroundColor: isAvailable ? colors.success : colors.muted },
          ]}
        >
          <Text style={styles.badgeText}>
            {isAvailable ? 'AKTIV' : 'INAKTIV'}
          </Text>
        </Pressable>

        <View style={styles.debugBox}>
          <Text style={styles.debugLine}>
            Watching: {watching ? 'Ja' : 'Nein'}
          </Text>
          <Text style={styles.debugLine}>
            Letzter Fix:{' '}
            {lastLocation
              ? `${lastLocation.lat?.toFixed(5)}, ${lastLocation.lng?.toFixed(
                  5
                )} (${Math.round(lastLocation.accuracy || 0)} m)`
              : '—'}
          </Text>
        </View>

        <Pressable onPress={onTestLocation} style={[styles.button, styles.ghost]}>
          <Text style={[styles.buttonText, { color: '#000' }]}>
            Standort testen
          </Text>
        </Pressable>
      </View>

      <View style={styles.btnGroup}>
        <Pressable
          disabled={isSending}
          onPress={() => onPressTriggerAlert({ useVerified: false })}
          style={[styles.button, styles.primary, isSending && styles.disabled]}
        >
          <Text style={styles.buttonText}>
            {isSending ? 'Sende…' : 'Alarm auslösen (öffentlich)'}
          </Text>
        </Pressable>

        <Pressable
          disabled={isSending}
          onPress={() => onPressTriggerAlert({ useVerified: true })}
          style={[styles.button, styles.secondary, isSending && styles.disabled]}
        >
          <Text style={styles.buttonText}>
            {isSending ? 'Sende…' : 'Alarm auslösen (nur verifiziert)'}
          </Text>
        </Pressable>
      </View>

      {/* Map-Bereich */}
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
          style={[styles.button, styles.secondary, { marginTop: 12 }]}
        >
          <Text style={styles.buttonText}>Browser-Benachrichtigungen aktivieren</Text>
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
  inlineRow: {
    marginTop: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subtitle: {
    color: colors.muted,
    marginTop: 6,
    flex: 1,
  },
  statusCard: {
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e5e5e5',
  },
  label: {
    ...typography.h3,
    marginBottom: 8,
    color: colors.text,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  badgeText: {
    color: '#fff',
    fontWeight: '700',
  },
  debugBox: {
    marginTop: 12,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#EFEFF4',
  },
  debugLine: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  btnGroup: {
    marginTop: 16,
    gap: 8, // falls RN-Version kein 'gap' kennt, ersetzen: dem ersten Button marginBottom: 8 geben
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
  ghost: {
    backgroundColor: '#fff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
    marginTop: 10,
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
