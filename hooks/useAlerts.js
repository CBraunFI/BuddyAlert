// hooks/useAlerts.js
import { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../firebaseConfig'; // ggf. Pfad anpassen

/**
 * useAlerts
 * Lädt Alerts aus Firestore abhängig vom Verifizierungsstatus.
 *
 * @param {boolean} isVerified - ob der aktuelle Nutzer verifiziert ist
 * @returns {{ alerts: Array, loading: boolean }}
 */
export function useAlerts(isVerified) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Referenz auf die Collection
    const alertsRef = collection(db, 'alerts');

    // Query: Verifizierte sehen alles; Unverifizierte nur "public".
    // Zusätzlich: Sortierung nach createdAt (neueste zuerst) und Limit für Performance.
    const q = isVerified
      ? query(alertsRef, orderBy('createdAt', 'desc'), limit(50))
      : query(
          alertsRef,
          where('visibility', '==', 'public'),
          orderBy('createdAt', 'desc'),
          limit(50)
        );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        // Daten mappen
        let list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Fallback-Sortierung, falls einzelne Dokumente (z.B. gerade erstellt)
        // noch keinen serverTimestamp haben.
        list = list.sort((a, b) => {
          const ta = a.createdAt?.toMillis?.() ?? 0;
          const tb = b.createdAt?.toMillis?.() ?? 0;
          return tb - ta; // desc
        });

        setAlerts(list);
        setLoading(false);
      },
      (err) => {
        console.error('useAlerts onSnapshot error:', err);
        setAlerts([]);
        setLoading(false);
      }
    );

    return () => {
      try {
        unsubscribe();
      } catch (e) {
        // defensive cleanup (falls unsubscribe bereits invalid ist)
        console.warn('useAlerts cleanup warn:', e);
      }
    };
  }, [isVerified]);

  return { alerts, loading };
}

// Optionaler Default-Export für flexible Imports
export default useAlerts;
