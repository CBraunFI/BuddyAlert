const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp();
const db = getFirestore();

// Hilfsfunktion für Distanz
function distanceInMeters(a, b) {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371000; // Erde in Metern
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const hav =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) *
    Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(hav), Math.sqrt(1 - hav));
  return R * c;
}

// Neuer Trigger in v2-Syntax
exports.onAlertCreate = onDocumentCreated("alerts/{alertId}", async (event) => {
  const alert = event.data.data();
  const creatorUid = alert.creatorUid;

  // Creator-Verifizierungsstatus nachziehen
  let creatorVerified = false;
  if (creatorUid) {
    const u = await db.doc(`users/${creatorUid}`).get();
    creatorVerified = !!(u.exists && u.data().isVerified);
  }

  await event.data.ref.update({ creatorVerified });

  // Kandidaten im Umkreis suchen
  const { lat, lng, radiusM = 500 } = alert;
  let q = db.collection("users").where("pushToken", "!=", null);

  if (alert.visibility === "verified") {
    q = q.where("isVerified", "==", true);
  }

  const candidatesSnap = await q.get();
  const targets = [];
  candidatesSnap.forEach((doc) => {
    const u = doc.data();
    if (!u.lastLocation) return;
    if (distanceInMeters(u.lastLocation, { lat, lng }) <= radiusM) {
      targets.push(u.pushToken);
    }
  });

  if (targets.length) {
    console.log("Would send push to:", targets.length, "devices");
    // TODO: call OneSignal/FCM here
  }
});
