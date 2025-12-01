// Import the functions you need from the SDKs you need
import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
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
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} catch (error) {
  console.log(
    "Failed to initialize Firebase. The connection could not be established.",
    error
  );
  throw error;
}

export { auth, app, db, storage };
