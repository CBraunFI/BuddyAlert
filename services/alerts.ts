// services/alerts.ts
import {
  db,
  serverTimestamp,
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
} from './db';
import { makeGeohash, type Coordinates } from './geo';
import { getUid } from './identity';
import { logError, ErrorSeverity } from '../utils/errorHandler';

// Visibility levels
export const VISIBILITY = {
  PUBLIC: 'public',
  VERIFIED: 'verified',
} as const;

export type VisibilityType = typeof VISIBILITY[keyof typeof VISIBILITY];

// Alert TTL (ms)
const ALERT_TTL_MS = 10 * 60 * 1000; // 10 minutes

export interface Alert {
  id: string;
  type: 'sos';
  lat: number;
  lng: number;
  geohash: string;
  visibility: VisibilityType;
  status: 'open' | 'resolved' | 'cancelled';
  radiusM: number;
  createdAt: any; // Firestore ServerTimestamp
  createdAtMs: number;
  expiresAtMs: number;
  requesterId: string;
  meta: {
    platform: string;
    version: number;
  };
}

export interface CreateAlertParams {
  lat: number;
  lng: number;
  visibility?: VisibilityType;
}

export interface SubscribeAlertsOptions {
  windowMs?: number;
  maxItems?: number;
}

/**
 * Creates a new alert with geohash and expiration
 * @returns Alert document ID
 */
export async function createAlert({ lat, lng, visibility = VISIBILITY.PUBLIC }: CreateAlertParams): Promise<string> {
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    const error = new Error('Ungültige Koordinaten für Alert.');
    logError(error, 'createAlert', ErrorSeverity.HIGH);
    throw error;
  }

  try {
    const uid = await getUid();
    const nowMs = Date.now();
    const expiresAtMs = nowMs + ALERT_TTL_MS;

    const payload = {
      type: 'sos',
      lat,
      lng,
      geohash: makeGeohash(lat, lng),
      visibility,
      status: 'open',
      radiusM: 500, // für spätere Auswahl des Benachrichtigungsradius
      createdAt: serverTimestamp(),
      createdAtMs: nowMs,     // clientseitig gesetzt, damit sofort filterbar
      expiresAtMs,            // clientseitig gesetzt
      requesterId: uid,
      meta: {
        platform: 'mvp',
        version: 1,
      },
    };

    const ref = await addDoc(collection(db, 'alerts'), payload);
    return ref.id;
  } catch (error: any) {
    logError(error, 'createAlert', ErrorSeverity.CRITICAL);
    throw error;
  }
}

/**
 * Subscribes to recent alerts (live feed)
 * @param callback Function called with array of alerts
 * @param options Subscription options
 * @returns Unsubscribe function
 */
export function subscribeRecentAlerts(
  callback: (alerts: Alert[]) => void,
  options: SubscribeAlertsOptions = {}
): () => void {
  const { windowMs = 60 * 60 * 1000, maxItems = 30 } = options;
  const minMs = Date.now() - windowMs;

  const q = query(
    collection(db, 'alerts'),
    where('createdAtMs', '>=', minMs),
    orderBy('createdAtMs', 'desc'),
    limit(maxItems)
  );

  const unsub = onSnapshot(q, (snap) => {
    const out: Alert[] = [];
    snap.forEach((d) => {
      const data = d.data();
      // Filter out expired alerts client-side (failsafe)
      if (typeof data.expiresAtMs === 'number' && data.expiresAtMs < Date.now()) return;
      out.push({ id: d.id, ...data } as Alert);
    });
    callback(out);
  });

  return () => unsub && unsub();
}

/**
 * Fallback position when GPS fails
 * MVP: Langenselbold center
 */
export async function getFallbackPosition(): Promise<Coordinates> {
  return { lat: 50.1778, lng: 9.0378 };
}

/**
 * Dev helper: creates 3 fake alerts near fallback position
 */
export async function addFakeAlerts(): Promise<void> {
  const base = await getFallbackPosition();
  const jitter = () => (Math.random() - 0.5) * 0.01; // ~±0.5–0.7 km

  const items = [
    { lat: base.lat + jitter(), lng: base.lng + jitter() },
    { lat: base.lat + jitter(), lng: base.lng + jitter() },
    { lat: base.lat + jitter(), lng: base.lng + jitter() },
  ];

  for (const p of items) {
    await createAlert({ lat: p.lat, lng: p.lng, visibility: VISIBILITY.PUBLIC });
  }
}
