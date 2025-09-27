// services/db.js
import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  serverTimestamp,
  Timestamp,
  collection,
  addDoc,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';

import firebaseConfig from '../firebaseConfig';

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Re-exports für Komfort
export {
  serverTimestamp,
  Timestamp,
  collection,
  addDoc,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
};
