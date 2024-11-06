import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBKls4H_tQiAkcNmfYhpJLg9mr7mKWcx_s",
  authDomain: "atfr-dashboard.firebaseapp.com",
  projectId: "atfr-dashboard",
  storageBucket: "atfr-dashboard.firebasestorage.app",
  messagingSenderId: "325266859490",
  appId: "1:325266859490:web:3256b0e4f9eb30a88a85bb"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Activer la persistence hors-ligne
enableIndexedDbPersistence(db).catch((err) => {
  console.error('Erreur de persistence Firebase:', err);
});