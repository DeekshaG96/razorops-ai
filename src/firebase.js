// C:\Users\ganch\.gemini\antigravity\scratch\razorops-ai\src\firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA2ZkJMVslr9EJQcH9Nf3x85pNDm41RmSE",
  authDomain: "razorops-ai.firebaseapp.com",
  projectId: "razorops-ai",
  storageBucket: "razorops-ai.firebasestorage.app",
  messagingSenderId: "779323945609",
  appId: "1:779323945609:web:32fb5be3200383a42a8c58",
  measurementId: "G-LTPSJT261L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
