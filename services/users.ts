// services/users.ts
import { db, doc, setDoc, serverTimestamp } from './db';

export interface Position {
  lat: number | null;
  lng: number | null;
  accuracy?: number | null;
  altitude?: number | null;
  speed?: number | null;
  heading?: number | null;
  ts?: number;
  raw?: any;
}

export interface UserLocation {
  lastLocation: {
    lat: number | null;
    lng: number | null;
    accuracy: number | null;
    altitude: number | null;
    speed: number | null;
    heading: number | null;
    ts: number;
  };
  lastSeenAt: any; // Firestore ServerTimestamp
  lastSeenAtMs: number;
  // Verification fields
  verified?: boolean;
  verifiedAt?: number;
  verificationProvider?: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
}

/**
 * Persists the user's last known location
 */
export async function setUserLastLocation(uid: string, pos: Position): Promise<void> {
  const payload: UserLocation = {
    lastLocation: {
      lat: pos.lat ?? null,
      lng: pos.lng ?? null,
      accuracy: pos.accuracy ?? null,
      altitude: pos.altitude ?? null,
      speed: pos.speed ?? null,
      heading: pos.heading ?? null,
      ts: pos.ts ?? Date.now(),
    },
    lastSeenAt: serverTimestamp(),
    lastSeenAtMs: Date.now(),
  };

  await setDoc(doc(db, 'users', uid), payload, { merge: true });
}
