import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, getFirestore, Firestore, setLogLevel, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getAuth, Auth, browserLocalPersistence, setPersistence } from 'firebase/auth';

export const firebaseConfig = {
  apiKey: "AIzaSyAwc6DNin86x7uskR6tkK29urGyvrzITwM",
  authDomain: "akngroupfrekans.firebaseapp.com",
  projectId: "akngroupfrekans",
  storageBucket: "akngroupfrekans.firebasestorage.app",
  messagingSenderId: "860522413382",
  appId: "1:860522413382:web:06fab57f4af2837599b947"
};

// Suppress noisy Firestore internal offline connection retry logs
try {
  setLogLevel('silent');
} catch {
  // Ignore
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

let firestoreDb: Firestore;
try {
  firestoreDb = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
    // Keep Firestore data available immediately after refresh and coordinate tabs.
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  });
} catch {
  firestoreDb = getFirestore(app);
}

export const db: Firestore = firestoreDb;
export const auth: Auth = getAuth(app);

// Keep any Firebase Auth session across reloads without creating anonymous users.
// The application has its own dealer/member credentials, so an anonymous sign-up
// request would be unnecessary and fails when Anonymous Authentication is disabled.
let authPersistenceReady: Promise<void> | null = null;
if (typeof window !== 'undefined') {
  authPersistenceReady = setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.debug('Firebase Auth persistence notice:', error);
  });
}

export async function ensureFirebaseAuthUser(_email?: string, _password?: string): Promise<any> {
  try {
    if (authPersistenceReady) {
      await authPersistenceReady;
    }
    return auth.currentUser || null;
  } catch (error) {
    // Firestore is also used with the app's local member session and public rules.
    console.debug('Firebase Auth availability notice:', error);
    return auth.currentUser || null;
  }
}

export default { db, auth, ensureFirebaseAuthUser, firebaseConfig };

