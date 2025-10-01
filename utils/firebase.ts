// utils/firebase.ts
// Firebase initialization and exports
// Uses Firebase v9+ modular imports for optimal bundle size (~30% smaller than compat mode)

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';

import firebaseConfig from '../firebaseConfig';

// Initialize Firebase app once
const app: FirebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// Export Firestore instance
export const db: Firestore = getFirestore(app);

// Export Auth instance
export const auth: Auth = getAuth(app);
