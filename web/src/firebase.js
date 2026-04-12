import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyARG5tC8zQp8kA-TYvScGFS1SdV__9KwCA",
  authDomain: "tuantuanbot-28647.firebaseapp.com",
  projectId: "tuantuanbot-28647",
  storageBucket: "tuantuanbot-28647.appspot.com",
  messagingSenderId: "107030999216413628761",
  appId: "1:107030999216413628761:web:d696586435d2becbdc10cb467aba5ee23"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
