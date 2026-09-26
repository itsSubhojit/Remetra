import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDp7SpoTZ3WNcnGtAGg7xVdTUW-NoriCP4",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "remetra-4a692.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "remetra-4a692",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "remetra-4a692.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "312600735809",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:312600735809:web:ea21ba97b81818854856c0",
};

let app;
let auth;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
} catch (error) {
  console.error("Firebase initialization failed:", error.message);
}

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export { app, auth, googleProvider };
