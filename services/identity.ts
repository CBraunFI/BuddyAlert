// services/identity.ts
import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const KEY = 'buddyalert_uid';

/**
 * Generates a UUID - uses native crypto.randomUUID on web, expo-crypto on mobile
 */
function generateUUID(): string {
  if (Platform.OS === 'web' && typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Gets or creates a unique user ID stored in AsyncStorage
 * @returns Promise<string> The user's unique identifier
 */
export async function getUid(): Promise<string> {
  const cached = await AsyncStorage.getItem(KEY);
  if (cached) return cached;

  let uid: string;
  if (Platform.OS === 'web') {
    uid = generateUUID();
  } else {
    // Mobile: Use expo-crypto
    uid = await (Crypto as any).randomUUID?.() || generateUUID();
  }

  await AsyncStorage.setItem(KEY, uid);
  return uid;
}
