// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDtCblt1HvfLfRC5cVJQdwyLinczt3fWaY",
  authDomain: "kshipra-study-partner.firebaseapp.com",
  projectId: "kshipra-study-partner",
  storageBucket: "kshipra-study-partner.firebasestorage.app",
  messagingSenderId: "341570955598",
  appId: "1:341570955598:web:ed8fbd11f42fa1086e961f",
  measurementId: "G-JMPQB3D5E7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, app, db };
