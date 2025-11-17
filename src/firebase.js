import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyB98c1K6XOFCFEsTN3KbiHY4wT9ymoE3KE",
  authDomain: "edc-bills-trail.firebaseapp.com",
  projectId: "edc-bills-trail",
  storageBucket: "edc-bills-trail.firebasestorage.app",
  messagingSenderId: "424967753520",
  appId: "1:424967753520:web:305fa7fe5bf4e382f302f5",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
