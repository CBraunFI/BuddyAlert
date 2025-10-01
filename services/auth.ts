// services/auth.ts
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  GoogleAuthProvider,
  GithubAuthProvider,
  OAuthProvider,
  onAuthStateChanged,
  type User,
  type UserCredential,
} from 'firebase/auth';
import { auth } from '../utils/firebase';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import { db } from './db';
import { logError, ErrorSeverity } from '../utils/errorHandler';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface VerifiedUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  provider: string;
  verified: boolean;
  verifiedAt: number;
  lastLoginAt: number;
}

export type AuthProvider = 'google' | 'github' | 'apple' | 'microsoft';

const VERIFIED_USER_KEY = 'buddyalert_verified_user';

/**
 * Initialize OAuth provider based on type
 */
function getOAuthProvider(provider: AuthProvider): GoogleAuthProvider | GithubAuthProvider | OAuthProvider {
  switch (provider) {
    case 'google':
      const googleProvider = new GoogleAuthProvider();
      googleProvider.addScope('profile');
      googleProvider.addScope('email');
      return googleProvider;
    
    case 'github':
      const githubProvider = new GithubAuthProvider();
      githubProvider.addScope('read:user');
      githubProvider.addScope('user:email');
      return githubProvider;
    
    case 'apple':
      const appleProvider = new OAuthProvider('apple.com');
      appleProvider.addScope('email');
      appleProvider.addScope('name');
      return appleProvider;
    
    case 'microsoft':
      const msProvider = new OAuthProvider('microsoft.com');
      msProvider.addScope('User.Read');
      return msProvider;
    
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

/**
 * Sign in with OAuth provider (popup method for web)
 */
export async function signInWithOAuth(provider: AuthProvider): Promise<VerifiedUser> {
  try {
    const oauthProvider = getOAuthProvider(provider);
    let result: UserCredential;

    try {
      // Try popup first (works better on web)
      result = await signInWithPopup(auth, oauthProvider);
    } catch (popupError: any) {
      // Fallback to redirect if popup is blocked
      if (popupError.code === 'auth/popup-blocked') {
        console.log('Popup blocked, using redirect method');
        await signInWithRedirect(auth, oauthProvider);
        // The result will be handled by checkRedirectResult()
        throw new Error('REDIRECT_IN_PROGRESS');
      }
      throw popupError;
    }

    const user = result.user;
    const verifiedUser = await createVerifiedUser(user, provider);
    
    return verifiedUser;
  } catch (error: any) {
    logError(error, `signInWithOAuth:${provider}`, ErrorSeverity.HIGH);
    throw error;
  }
}

/**
 * Check for redirect result (after OAuth redirect)
 */
export async function checkRedirectResult(): Promise<VerifiedUser | null> {
  try {
    const result = await getRedirectResult(auth);
    if (!result || !result.providerId) return null;

    const provider = result.providerId.split('.')[0] as AuthProvider;
    const verifiedUser = await createVerifiedUser(result.user, provider);

    return verifiedUser;
  } catch (error: any) {
    logError(error, 'checkRedirectResult', ErrorSeverity.MEDIUM);
    return null;
  }
}

/**
 * Create or update verified user in Firestore
 */
async function createVerifiedUser(user: User, provider: string): Promise<VerifiedUser> {
  const verifiedUser: VerifiedUser = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    provider,
    verified: true,
    verifiedAt: Date.now(),
    lastLoginAt: Date.now(),
  };

  // Store in Firestore
  await setDoc(
    doc(db, 'users', user.uid),
    {
      ...verifiedUser,
      updatedAt: Date.now(),
    },
    { merge: true }
  );

  // Cache in AsyncStorage
  await AsyncStorage.setItem(VERIFIED_USER_KEY, JSON.stringify(verifiedUser));

  return verifiedUser;
}

/**
 * Get current verified user
 */
export async function getVerifiedUser(): Promise<VerifiedUser | null> {
  try {
    // Check AsyncStorage cache first
    const cached = await AsyncStorage.getItem(VERIFIED_USER_KEY);
    if (cached) {
      return JSON.parse(cached);
    }

    // Check Firebase Auth
    const user = auth.currentUser;
    if (!user) return null;

    // Fetch from Firestore
    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data() as VerifiedUser;
      if (data.verified) {
        await AsyncStorage.setItem(VERIFIED_USER_KEY, JSON.stringify(data));
        return data;
      }
    }

    return null;
  } catch (error: any) {
    logError(error, 'getVerifiedUser', ErrorSeverity.LOW);
    return null;
  }
}

/**
 * Check if user is verified
 */
export async function isUserVerified(): Promise<boolean> {
  const user = await getVerifiedUser();
  return user?.verified ?? false;
}

/**
 * Sign out user
 */
export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
    await AsyncStorage.removeItem(VERIFIED_USER_KEY);
  } catch (error: any) {
    logError(error, 'signOutUser', ErrorSeverity.MEDIUM);
    throw error;
  }
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

/**
 * Get user verification status from Firestore
 */
export async function getUserVerificationStatus(uid: string): Promise<boolean> {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return data.verified === true;
    }
    
    return false;
  } catch (error: any) {
    logError(error, 'getUserVerificationStatus', ErrorSeverity.LOW);
    return false;
  }
}
