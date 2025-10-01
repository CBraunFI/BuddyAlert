// services/db.ts
// Central re-export for all Firestore functionality

import {
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
  type Firestore,
  type DocumentReference,
  type CollectionReference,
  type Query,
  type QuerySnapshot,
  type DocumentSnapshot,
} from 'firebase/firestore';

// Import db from centralized firebase initialization
import { db } from '../utils/firebase';

// Re-export db and types
export { db };
export type {
  Firestore,
  DocumentReference,
  CollectionReference,
  Query,
  QuerySnapshot,
  DocumentSnapshot,
};

// Re-export Firestore functions
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
