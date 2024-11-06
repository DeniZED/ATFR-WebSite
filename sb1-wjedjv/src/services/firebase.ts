import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDZR7Wd4BPOz1nQB3S9sol_YndL_f1vQhY",
  authDomain: "atfr-clan.firebaseapp.com",
  projectId: "atfr-clan",
  storageBucket: "atfr-clan.appspot.com",
  messagingSenderId: "500191501",
  appId: "1:500191501:web:f4b223b78c2d500191501"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);