import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; 
import AsyncStorage from "@react-native-async-storage/async-storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA_idRo88LcOub8nCm7p7gvcLOkyYBRG2s",
  authDomain: "talas-2bbd7.firebaseapp.com",
  projectId: "talas-2bbd7",
  storageBucket: "talas-2bbd7.appspot.com",
  messagingSenderId: "608458232759",
  appId: "1:608458232759:web:83c3320c9e2baf694f0e32"
};

// Initialize Firebase (Ensure that we only initialize once)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp(); // Prevent duplicate Firebase initialization

let auth;
let db;

if (!getAuth(app)) {
  try {
    // Initialize Auth with persistence if it hasn't been initialized already
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    console.error("Firebase Auth initialization error:", error);
  }
} else {
  auth = getAuth(app); // Use the existing auth instance
}

// Initialize Firestore
db = getFirestore(app);

export { app, auth, db }; // Export app, auth, and db
