
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyCbMBLE3r_qmVwaruRWm3tu9um5wqgS9DY",
  authDomain: "keraza-shark.firebaseapp.com",
  projectId: "keraza-shark",
  storageBucket: "keraza-shark.firebasestorage.app",
  messagingSenderId: "126837559653",
  appId: "1:126837559653:web:39199642dd1dcb31b0918c",
  measurementId: "G-ZCNS652NET"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };