// firebaseConfig.ts
// Firebase configuration using environment variables for security

export interface FirebaseConfig {
  apiKey: string | undefined;
  authDomain: string | undefined;
  projectId: string | undefined;
  storageBucket: string | undefined;
  messagingSenderId: string | undefined;
  appId: string | undefined;
  measurementId: string | undefined;
}

const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Validate required Firebase config fields
const requiredFields: (keyof FirebaseConfig)[] = ['apiKey', 'authDomain', 'projectId', 'appId'];
const missingFields = requiredFields.filter(field => !firebaseConfig[field]);

if (missingFields.length > 0) {
  const errorMsg = `❌ Firebase Config Error: Missing required environment variables:\n${missingFields.map(f => `  - EXPO_PUBLIC_FIREBASE_${f.replace(/([A-Z])/g, '_$1').toUpperCase()}`).join('\n')}\n\nPlease create a .env file with these variables.`;
  console.error(errorMsg);
  throw new Error(`Firebase configuration incomplete. Missing: ${missingFields.join(', ')}`);
}

export default firebaseConfig as Required<FirebaseConfig>;
