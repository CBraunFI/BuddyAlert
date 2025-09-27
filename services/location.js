// services/location.js
import * as Location from 'expo-location';

const DEFAULT_ACCURACY = Location.Accuracy.Balanced;
const BACKGROUND_ACCURACY = Location.Accuracy.Low; // Better battery performance for background tracking

/**
 * Prüft und fragt Foreground-Permission ab.
 * Gibt ein Objekt zurück: { granted, status, canAskAgain }
 */
export async function requestLocationPermissions() {
  const { status, granted, canAskAgain } =
    await Location.requestForegroundPermissionsAsync();

  return { granted, status, canAskAgain };
}

/**
 * Holt die aktuelle Position (einmalig).
 * Nutzt Timeout-Logik und normiert die Ausgabe.
 */
export async function getCurrentPositionSafe(options = {}) {
  const {
    timeoutMs = 8000,
    maximumAgeMs = 60_000,
    accuracy = DEFAULT_ACCURACY,
  } = options;

  // 1) Permission check
  const { granted, status, canAskAgain } = await requestLocationPermissions();
  if (!granted) {
    if (status === 'denied' && !canAskAgain) {
      throw new Error(
        'Standortberechtigung dauerhaft verweigert. Bitte in den Systemeinstellungen erlauben.'
      );
    }
    throw new Error('Standortberechtigung verweigert.');
  }

  // 2) Position holen (mit Soft-Timeout)
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const pos = await Location.getCurrentPositionAsync({
      accuracy,
      maximumAge: maximumAgeMs,
      mayShowUserSettingsDialog: false,
    });

    clearTimeout(timeout);

    if (!pos?.coords) throw new Error('Unerwartetes Positionsformat.');

    return normalizePosition(pos);
  } catch (e) {
    clearTimeout(timeout);
    if (String(e?.message || '').toLowerCase().includes('aborted')) {
      throw new Error('Zeitüberschreitung beim Bestimmen der Position.');
    }
    throw e;
  }
}

/**
 * Startet ein Foreground-Tracking.
 * onUpdate(position) wird bei jeder Änderung aufgerufen.
 * Liefert ein Handle mit stop().
 */
export async function watchPositionSafe(onUpdate, options = {}) {
  const {
    accuracy = BACKGROUND_ACCURACY, // Use lower accuracy for better battery life
    timeInterval = 10000, // Increased from 3s to 10s for better battery performance
    distanceInterval = 10, // Increased from 5m to 10m to reduce unnecessary updates
  } = options;

  const { granted } = await requestLocationPermissions();
  if (!granted) {
    throw new Error('Standortberechtigung verweigert.');
  }

  const subscription = await Location.watchPositionAsync(
    {
      accuracy,
      timeInterval,
      distanceInterval,
      mayShowUserSettingsDialog: false,
    },
    (pos) => {
      if (pos?.coords) {
        onUpdate(normalizePosition(pos));
      }
    }
  );

  return {
    stop: () => {
      try {
        subscription?.remove();
      } catch {}
    },
  };
}

/**
 * Normiert die Positionsdaten.
 */
function normalizePosition(pos) {
  const { coords, timestamp } = pos || {};
  return {
    lat: coords?.latitude ?? null,
    lng: coords?.longitude ?? null,
    accuracy: coords?.accuracy ?? null,
    altitude: coords?.altitude ?? null,
    speed: coords?.speed ?? null,
    heading: coords?.heading ?? null,
    ts: timestamp ?? Date.now(),
    raw: pos,
  };
}
