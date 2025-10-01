// services/location.ts
import * as Location from 'expo-location';
import { logError, ErrorSeverity } from '../utils/errorHandler';
import type { Position } from './users';

const DEFAULT_ACCURACY = Location.Accuracy.Balanced;
const BACKGROUND_ACCURACY = Location.Accuracy.Low; // Better battery performance for background tracking

export interface LocationPermissionResponse {
  granted: boolean;
  status: Location.PermissionStatus;
  canAskAgain: boolean;
}

export interface GetPositionOptions {
  timeoutMs?: number;
  maximumAgeMs?: number;
  accuracy?: Location.Accuracy;
}

export interface WatchPositionOptions {
  accuracy?: Location.Accuracy;
  timeInterval?: number;
  distanceInterval?: number;
}

export interface WatchHandle {
  stop: () => void;
}

/**
 * Checks and requests foreground location permission
 */
export async function requestLocationPermissions(): Promise<LocationPermissionResponse> {
  const { status, granted, canAskAgain } =
    await Location.requestForegroundPermissionsAsync();

  return { granted, status, canAskAgain };
}

/**
 * Gets current position with timeout logic
 */
export async function getCurrentPositionSafe(options: GetPositionOptions = {}): Promise<Position> {
  const {
    timeoutMs = 8000,
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
      mayShowUserSettingsDialog: false,
    });

    clearTimeout(timeout);

    if (!pos?.coords) {
      const error = new Error('Unerwartetes Positionsformat.');
      logError(error, 'getCurrentPositionSafe', ErrorSeverity.MEDIUM);
      throw error;
    }

    return normalizePosition(pos);
  } catch (e: any) {
    clearTimeout(timeout);
    if (String(e?.message || '').toLowerCase().includes('aborted')) {
      const timeoutError = new Error('Zeitüberschreitung beim Bestimmen der Position.');
      logError(timeoutError, 'getCurrentPositionSafe', ErrorSeverity.LOW);
      throw timeoutError;
    }
    logError(e, 'getCurrentPositionSafe', ErrorSeverity.MEDIUM);
    throw e;
  }
}

/**
 * Starts foreground position tracking
 * @param onUpdate Callback called on each position update
 * @param options Watch options
 * @returns Handle with stop() method
 */
export async function watchPositionSafe(
  onUpdate: (position: Position) => void | Promise<void>,
  options: WatchPositionOptions = {}
): Promise<WatchHandle> {
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
 * Normalizes position data from expo-location
 */
function normalizePosition(pos: Location.LocationObject): Position {
  const { coords, timestamp } = pos;
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
