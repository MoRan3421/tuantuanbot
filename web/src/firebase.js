import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  projectId: "tuantuanbot-28647",
  appId: "1:372694962939:web:888b767d62eef744f2565e",
  storageBucket: "tuantuanbot-28647.firebasestorage.app",
  apiKey: "AIzaSyBvqS8HIJ-yacn_YQfGt49Pb6IVpXw4igE",
  authDomain: "tuantuanbot-28647.firebaseapp.com",
  messagingSenderId: "372694962939",
  measurementId: "G-2MYN99G2KZ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
