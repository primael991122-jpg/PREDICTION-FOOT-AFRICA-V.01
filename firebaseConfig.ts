
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, enableIndexedDbPersistence, doc, getDocFromServer } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

let app: any = null;
let auth: any = null;
let db: any = null;
let isFirebaseConfigured = false;

if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = initializeFirestore(app, { experimentalForceLongPolling: true });
    isFirebaseConfigured = true;
  } catch (error) {
    console.error("❌ Failed to initialize Firebase:", error);
  }
} else {
  console.warn(
    "⚠️ Firebase configuration is missing! Please configure the environment variables VITE_FIREBASE_* in your deployment platform (Netlify, Vercel, etc.)."
  );
}

export { auth, db, isFirebaseConfigured };

// Enable Offline Persistence
if (db && typeof window !== 'undefined') {
    enableIndexedDbPersistence(db).catch((err) => {
        if (err.code == 'failed-precondition') {
            // Multiple tabs open, persistence can only be enabled in one tab at a a time.
            console.warn("Firestore persistence failed: Multiple tabs open.");
        } else if (err.code == 'unimplemented') {
            // The current browser does not support all of the features required to enable persistence
            console.warn("Firestore persistence not supported by this browser.");
        }
    });
}

// Connection test
async function testConnection() {
  if (!db) return;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("✅ Firestore connected successfully!");
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("❌ Firestore connection failed: the client is offline. Please check your Firebase configuration and internet connection.");
    } else {
      console.log("ℹ️ Firestore connection status:", error);
    }
  }
}
testConnection();
