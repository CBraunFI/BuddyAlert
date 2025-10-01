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
import { useTranslation } from 'react-i18next';
import Animated, {
  FadeInDown,
  FadeInUp,
  SlideInRight,
  useAnimatedStyle,
  withSpring,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
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
import { getVerifiedUser, signOutUser, isUserVerified } from '../services/auth';
import MapShim from '../components/MapShim';

export default function HomeScreen({ navigation }) {
  const { t } = useTranslation();
  const [isSending, setIsSending] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [initialRegion, setInitialRegion] = useState(null);
  const [verifiedUser, setVerifiedUser] = useState(null);

  // Block 1: Bereitschaft + Location-Watching
  const [isAvailable, setIsAvailable] = useState(false);
  const [watching, setWatching] = useState(false);
  const watchHandleRef = useRef(null);
  const [lastLocation, setLastLocation] = useState(null);
  const lastFirestoreUpdateRef = useRef(0); // Track last Firestore write timestamp

  // Live-Alerts laden (neueste zuerst)
  useEffect(() => {
    const unsub = subscribeRecentAlerts((docs) => {
      setAlerts(docs);
      // initiale Kartenregion setzen (1x), wenn noch keine da ist
      setInitialRegion((prev) => {
        if (prev) return prev;
        const first = docs[0];
        if (first?.lat && first?.lng) {
          return {
            latitude: first.lat,
            longitude: first.lng,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          };
        }
        return prev;
      });
    });
    return () => {
      if (typeof unsub === 'function') {
        unsub();
      }
    };
  }, []); // Remove initialRegion dependency to prevent re-subscriptions

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

  // Load verified user status
  useEffect(() => {
    loadVerifiedUser();
  }, []);

  async function loadVerifiedUser() {
    try {
      const user = await getVerifiedUser();
      setVerifiedUser(user);
    } catch (error) {
      console.error('Error loading verified user:', error);
    }
  }

  const onLogout = useCallback(async () => {
    try {
      await signOutUser();
      setVerifiedUser(null);
      RNAlert.alert(t('common.success'), t('verification.logout'));
    } catch (error) {
      RNAlert.alert(t('common.error'), error?.message || t('errors.generic'));
    }
  }, [t]);

  const onNavigateToVerification = useCallback(() => {
    navigation.navigate('VerificationScreen');
  }, [navigation]);

  // Stable function references using useCallback
  const stopWatching = useCallback(() => {
    try {
      watchHandleRef.current?.stop?.();
    } catch {}
    watchHandleRef.current = null;
    setWatching(false);
  }, []);

  const startWatching = useCallback(async () => {
    if (watching) return;
    try {
      const handle = await watchPositionSafe(async (pos) => {
        setLastLocation(pos);
        // Optional: initiale Region beim ersten Fix setzen
        setInitialRegion((prev) => {
          if (prev || !pos?.lat || !pos?.lng) return prev;
          return {
            latitude: pos.lat,
            longitude: pos.lng,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          };
        });
        // Throttle Firestore writes to every 30 seconds minimum
        const now = Date.now();
        const timeSinceLastUpdate = now - lastFirestoreUpdateRef.current;
        const MIN_UPDATE_INTERVAL = 30000; // 30 seconds

        if (timeSinceLastUpdate >= MIN_UPDATE_INTERVAL) {
          try {
            const uid = await getUid();
            await setUserLastLocation(uid, pos);
            lastFirestoreUpdateRef.current = now;
          } catch (e) {
            console.warn('setUserLastLocation fehlgeschlagen:', e?.message);
          }
        }
      });
      watchHandleRef.current = handle;
      setWatching(true);
    } catch (err) {
      console.warn('[watchPositionSafe] Fehler:', err?.message);
      RNAlert.alert(
        t('location.title'),
        t('location.error')
      );
      setWatching(false);
    }
  }, [watching]);

  // Watch steuern: in Bereitschaft tracken, sonst stoppen
  useEffect(() => {
    if (isAvailable) {
      startWatching();
    } else {
      stopWatching();
    }
    return stopWatching; // Cleanup beim Unmount
  }, [isAvailable, startWatching, stopWatching]);

  const onToggleAvailability = useCallback(async () => {
    const next = !isAvailable;
    setIsAvailable(next);
    try {
      await AsyncStorage.setItem('availability', JSON.stringify(next));
    } catch {}
  }, [isAvailable]);

  const onPressTriggerAlert = useCallback(async ({ useVerified = false } = {}) => {
    console.log('🔴 onPressTriggerAlert called, useVerified:', useVerified);
    try {
      setIsSending(true);
      console.log('🔴 isSending set to true');

      // Check if user is verified for verified-only alerts
      if (useVerified && !verifiedUser) {
        console.log('🔴 User not verified, showing alert');
        RNAlert.alert(
          t('verification.notVerified'),
          t('verification.verifyNow'),
          [
            { text: t('common.cancel'), style: 'cancel' },
            { text: t('verification.verifyNow'), onPress: onNavigateToVerification }
          ]
        );
        setIsSending(false);
        return;
      }

      // 1) Echte Position versuchen, sonst Fallback + Nutzerhinweis
      console.log('🔴 Getting current position...');
      let coords;
      try {
        coords = await getCurrentPositionSafe({ timeoutMs: 8000 });
        console.log('🔴 Position obtained:', coords);
      } catch (locErr) {
        console.warn('🔴 Geo fehlgeschlagen, nutze Fallback:', locErr?.message);
        RNAlert.alert(
          t('common.error'),
          t('location.fallbackUsed', { error: locErr?.message })
        );
        coords = await getFallbackPosition();
        console.log('🔴 Fallback position:', coords);
      }

      // 2) Alert anlegen
      console.log('🔴 Creating alert with coords:', coords);
      const id = await createAlert({
        lat: coords.lat,
        lng: coords.lng,
        visibility: useVerified ? VISIBILITY.VERIFIED : VISIBILITY.PUBLIC,
      });

      console.log('✅ Alert created:', id, 'Navigating to AlarmScreen...');

      // 3) Navigate to AlarmScreen to show the created alarm
      navigation.navigate('AlarmScreen', {
        alertId: id,
        lat: coords.lat,
        lng: coords.lng,
        distanceM: null,
        sinceSec: null,
      });
    } catch (e) {
      console.error('Alert fehlgeschlagen', e);
      RNAlert.alert(
        t('home.alerts.failed'),
        e?.message ?? t('errors.generic')
      );
    } finally {
      setIsSending(false);
    }
  }, [t, verifiedUser, onNavigateToVerification]);

  const onSeedFakeAlerts = useCallback(async () => {
    try {
      setIsSending(true);
      const { addFakeAlerts } = await import('../services/alerts');
      await addFakeAlerts();
      RNAlert.alert(t('common.success'), t('home.alerts.seedingSuccess'));
    } catch (e) {
      console.error('Seeding fehlgeschlagen', e);
      RNAlert.alert(t('home.alerts.seedingError'), e?.message ?? t('errors.generic'));
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

  const onTestLocation = useCallback(async () => {
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
        t('location.determined'),
        t('location.determinedMessage', {
          lat: pos.lat?.toFixed(5),
          lng: pos.lng?.toFixed(5),
          accuracy: Math.round(pos.accuracy || 0)
        })
      );
    } catch (e) {
      RNAlert.alert(
        t('common.error'),
        e?.message ?? t('location.error')
      );
    }
  }, [initialRegion]);

  // Memoize map markers to prevent unnecessary re-renders
  const mapMarkers = useMemo(() => alerts, [alerts]);

  // Animated values for status badge
  const badgeScale = useSharedValue(1);

  const badgeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
  }));

  // Trigger animation when availability changes
  useEffect(() => {
    badgeScale.value = withSpring(1.1, {}, () => {
      badgeScale.value = withSpring(1);
    });
  }, [isAvailable]);

  return (
    <View style={styles.container}>
      <Animated.Text entering={FadeInUp.duration(600)} style={typography.h1}>
        {t('home.title')}
      </Animated.Text>

      {/* Bereitschaft + Debug */}
      <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.inlineRow}>
        <Text style={[styles.subtitle, typography.h3]}>
          {t('home.subtitle')}
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.statusCard}>
        <Text style={styles.label}>{t('home.availability.label')}</Text>
        <Pressable onPress={onToggleAvailability}>
          <Animated.View
            style={[
              styles.badge,
              { backgroundColor: isAvailable ? colors.success : colors.muted },
              badgeAnimatedStyle,
            ]}
          >
            <Text style={styles.badgeText}>
              {isAvailable ? t('home.availability.active') : t('home.availability.inactive')}
            </Text>
          </Animated.View>
        </Pressable>

        <View style={styles.debugBox}>
          <Text style={styles.debugLine}>
            {t('home.availability.watching')} {watching ? t('home.availability.yes') : t('home.availability.no')}
          </Text>
          <Text style={styles.debugLine}>
            {t('home.availability.lastFix')}{' '}
            {lastLocation
              ? `${lastLocation.lat?.toFixed(5)}, ${lastLocation.lng?.toFixed(
                  5
                )} (${Math.round(lastLocation.accuracy || 0)} m)`
              : '—'}
          </Text>
        </View>

        <Pressable onPress={onTestLocation} style={[styles.button, styles.ghost]}>
          <Text style={[styles.buttonText, { color: '#000' }]}>
            {t('home.buttons.testLocation')}
          </Text>
        </Pressable>

        {/* Verification Status */}
        <View style={styles.verificationSection}>
          <Text style={styles.label}>{t('verification.title')}:</Text>
          {verifiedUser ? (
            <View style={styles.verifiedContainer}>
              <View style={[styles.badge, { backgroundColor: colors.success }]}>
                <Text style={styles.badgeText}>{t('verification.verifiedBadge')}</Text>
              </View>
              <Text style={styles.verifiedText}>
                {verifiedUser.displayName || verifiedUser.email}
              </Text>
              <Pressable onPress={onLogout} style={[styles.button, styles.ghost, {marginTop: 8}]}>
                <Text style={[styles.buttonText, { color: '#000' }]}>
                  {t('verification.logout')}
                </Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={onNavigateToVerification}
              style={[styles.button, styles.primary, { marginTop: 8 }]}
            >
              <Text style={styles.buttonText}>
                {t('verification.verifyNow')}
              </Text>
            </Pressable>
          )}
        </View>
      </Animated.View>

      <Animated.View entering={SlideInRight.delay(600).duration(600)} style={styles.btnGroup}>
        <Pressable
          disabled={isSending}
          onPress={() => onPressTriggerAlert({ useVerified: false })}
          style={[styles.button, styles.primary, isSending && styles.disabled]}
        >
          <Text style={styles.buttonText}>
            {isSending ? t('home.buttons.sending') : t('home.buttons.triggerAlarmPublic')}
          </Text>
        </Pressable>

        <Pressable
          disabled={isSending}
          onPress={() => onPressTriggerAlert({ useVerified: true })}
          style={[styles.button, styles.secondary, isSending && styles.disabled]}
        >
          <Text style={styles.buttonText}>
            {isSending ? t('home.buttons.sending') : t('home.buttons.triggerAlarmVerified')}
          </Text>
        </Pressable>
      </Animated.View>

      {/* Map-Bereich */}
      <Animated.View entering={FadeInUp.delay(800).duration(800)} style={styles.mapContainer}>
        {initialRegion ? (
          <MapShim region={initialRegion} alerts={mapMarkers} />
        ) : (
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapPlaceholderText}>{t('home.map.loading')}</Text>
          </View>
        )}
      </Animated.View>

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
          {isSending ? t('home.buttons.sending') : t('home.buttons.seedFake')}
        </Text>
      </Pressable>

      {/* Web: OneSignal-Prompt auslösen */}
      {Platform.OS === 'web' && (
        <Pressable
          onPress={onRequestWebPushPermission}
          style={[styles.button, styles.secondary, { marginTop: 12 }]}
        >
          <Text style={styles.buttonText}>{t('home.buttons.webPush')}</Text>
        </Pressable>
      )}

      {/* About Button */}
      <Pressable
        onPress={() => navigation.navigate('AboutScreen')}
        style={[styles.button, styles.ghost, { marginTop: 12 }]}
      >
        <Text style={[styles.buttonText, { color: '#000' }]}>
          {t('home.buttons.about')}
        </Text>
      </Pressable>
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
  verificationSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e5e5',
  },
  verifiedContainer: {
    marginTop: 8,
  },
  verifiedText: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 8,
  },
});
