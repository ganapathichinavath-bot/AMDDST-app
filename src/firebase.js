import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD3SgxUhZweeSIqmKmpaq78kOXoY3ZytE0",
  authDomain: "amddst-app.firebaseapp.com",
  projectId: "amddst-app",
  storageBucket: "amddst-app.firebasestorage.app",
  messagingSenderId: "911391384155",
  appId: "1:911391384155:web:bc8171ff4eb8fb0e50957e"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();