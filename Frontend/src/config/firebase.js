import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyPlaceholderDevKeyForRemetraApp123",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "remetra-4a692.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "remetra-4a692",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "remetra-4a692.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "104862259655496094124",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:104862259655496094124:web:remetraapp",
};

let app;
let auth;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
} catch (error) {
  console.warn("Firebase initialization warning (please ensure VITE_FIREBASE_API_KEY is configured):", error.message);
}

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export { app, auth, googleProvider };
