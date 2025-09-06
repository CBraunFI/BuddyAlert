// utils/firebase.js
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebaseConfig';

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const db = getFirestore(app);
// Kein Auth-Import/-Export mehr – vermeidet identitytoolkit-Calls
