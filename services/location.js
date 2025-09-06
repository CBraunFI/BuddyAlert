// services/location.js
import * as Location from 'expo-location';

/**
 * Holt die aktuelle Position, fragt Permission „whenInUse“ an,
 * validiert das Ergebnis und wirft bei Problemen einen aussagekräftigen Fehler.
 */
export async function getCurrentPositionSafe(options = {}) {
  const {
    timeoutMs = 8000,                 // wie lange warten wir maximal?
    maximumAgeMs = 60_000,            // akzeptiere gecachte Pos. bis 60s
    accuracy = Location.Accuracy.Balanced, // Balanced reicht fürs MVP
  } = options;

  // 1) Permission anfragen
  const { status, canAskAgain, granted } = await Location.requestForegroundPermissionsAsync();

  if (!granted) {
    // keine Freigabe → klarer Grund
    if (status === 'denied' && !canAskAgain) {
      throw new Error('Standortberechtigung dauerhaft verweigert. Bitte in den Systemeinstellungen erlauben.');
    }
    throw new Error('Standortberechtigung verweigert.');
  }

  // 2) Position holen (mit Timeout)
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const pos = await Location.getCurrentPositionAsync({
      accuracy,
      maximumAge: maximumAgeMs,
      mayShowUserSettingsDialog: false,
      // Signal wird von expo-location intern nicht direkt unterstützt;
      // der Timeout oben dient als „Soft“-Abbruch in unserem Codepfad.
    });

    clearTimeout(timeout);

    if (!pos?.coords || typeof pos.coords.latitude !== 'number' || typeof pos.coords.longitude !== 'number') {
      throw new Error('Unerwartetes Positionsformat.');
    }

    return {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy ?? null,
    };
  } catch (e) {
    clearTimeout(timeout);
    // Abbruch/Timeout sinnvoll formulieren
    if (String(e?.message || '').toLowerCase().includes('aborted')) {
      throw new Error('Zeitüberschreitung beim Bestimmen der Position.');
    }
    throw e;
  }
}
