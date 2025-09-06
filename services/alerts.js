// services/alerts.js
import {
  doc,
  setDoc,
  serverTimestamp,
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../utils/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// kleine, stabile Geräte-ID ohne Native-Module
async function getOrCreateDeviceId() {
  const KEY = 'deviceId';
  let id = await AsyncStorage.getItem(KEY);
  if (!id) {
    id = `dev_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    await AsyncStorage.setItem(KEY, id);
  }
  return id;
}

export const VISIBILITY = {
  PUBLIC: 'public',
  VERIFIED: 'verified',
};

export async function createAlert({
  lat,
  lng,
  visibility = VISIBILITY.PUBLIC,
  category = 'generic',
}) {
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    throw new Error('createAlert: lat/lng müssen Zahlen sein.');
  }
  if (!Object.values(VISIBILITY).includes(visibility)) {
    throw new Error('createAlert: visibility muss "public" oder "verified" sein.');
  }

  const alertsCol = collection(db, 'alerts');
  const alertId = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const now = serverTimestamp();
  const deviceId = await getOrCreateDeviceId();

  const data = {
    lat,
    lng,
    visibility,
    category,
    createdAt: now,
    expiresAt: null,   // später via Cloud Function setzen (Auto-Expire)
    status: 'active',  // 'active' | 'cleared' | 'expired'
    source: { type: 'device', deviceId },
    meta: { version: 1 },
  };

  await setDoc(doc(alertsCol, alertId), data);
  return alertId;
}

export async function addFakeAlerts() {
  const base = { lat: 50.154, lng: 9.043 };
  const fake = [
    { lat: base.lat + 0.001, lng: base.lng + 0.001, visibility: 'public',   category: 'generic' },
    { lat: base.lat + 0.003, lng: base.lng - 0.002, visibility: 'verified', category: 'harassment' },
    { lat: base.lat - 0.002, lng: base.lng + 0.004, visibility: 'public',   category: 'other' },
  ];
  for (const f of fake) {
    await createAlert(f);
  }
}

export async function getFallbackPosition() {
  return { lat: 50.154, lng: 9.043 };
}

/**
 * Live-Subscription auf die neuesten Alerts (für Map/List).
 * Ruft cb(items) bei jeder Änderung auf. items ist ein Array mit validen Punkten.
 *
 * @param {(items: Array<{id: string, lat: number, lng: number, visibility: string, createdAt: any, status?: string}> ) => void} cb
 * @param {number} limitCount - wie viele Einträge maximal laden (Default 50)
 * @returns {() => void} unsubscribe
 */
export function subscribeRecentAlerts(cb, limitCount = 50) {
  const alertsCol = collection(db, 'alerts');
  const q = query(alertsCol, orderBy('createdAt', 'desc'), limit(limitCount));

  return onSnapshot(q, (snap) => {
    const items = [];
    snap.forEach((d) => {
      const data = d.data();
      if (typeof data?.lat === 'number' && typeof data?.lng === 'number') {
        items.push({ id: d.id, ...data });
      }
    });
    cb(items);
  });
}
