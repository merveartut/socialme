// src/firebase.js or src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBcxXjwPntb_xNdGzeVv4e2FJw4jvo7-tU",
  authDomain: "socialme-c4c81.firebaseapp.com",
  projectId: "socialme-c4c81",
  storageBucket: "socialme-c4c81.firebasestorage.app",
  messagingSenderId: "270073741",
  appId: "1:270073741:web:6be439ae31052e3aa747c4",
  measurementId: "G-BXZ6PF7CHG",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
