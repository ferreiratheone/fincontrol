import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const getFirebaseConfig = () => {
  try {
    if (typeof window !== 'undefined' && window.__firebase_config) {
      return JSON.parse(window.__firebase_config);
    }
    // Fallback for local development using vite environment variables
    const env = (import.meta as any).env;
    return {
      apiKey: env.VITE_FIREBASE_API_KEY,
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: env.VITE_FIREBASE_APP_ID
    };
  } catch (e) {
    return null;
  }
};

const firebaseConfig = getFirebaseConfig();

// Initialize Firebase with fallback to prevent blank screen crash
if (firebaseConfig?.apiKey) {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
} else {
  // Prevent crash in demo/dev mode when env vars are missing
  if (!firebase.apps.length) {
    firebase.initializeApp({
      apiKey: "demo",
      projectId: "demo-project",
      authDomain: "demo.firebaseapp.com"
    });
  }
}

export const auth = firebase.auth();
export const db = firebase.firestore();

// Enable offline persistence
if (typeof window !== 'undefined') {
  db.enablePersistence()
    .catch((err) => {
      if (err.code === 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled in one tab at a a time.
        console.warn('Firestore persistence failed: Multiple tabs open');
      } else if (err.code === 'unimplemented') {
        // The current browser does not support all of the features required to enable persistence
        console.warn('Firestore persistence failed: Browser not supported');
      }
    });
}

export const googleProvider = new firebase.auth.GoogleAuthProvider();

export const isDemo = !firebaseConfig?.apiKey;