import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // Replace with your Firebase config
  apiKey: "AIzaSyCamNGDvQlPzAjDN2-ShtWGSzmiQVtBZvA",
  authDomain: "voile-boutique.firebaseapp.com",
  projectId: "voile-boutique",
  storageBucket: "voile-boutique.firebasestorage.app",
  messagingSenderId: "1002046828723",
  appId: "1:1002046828723:web:656c620556a49794a840c6",
  measurementId: "G-2WYVXV5BGP"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;