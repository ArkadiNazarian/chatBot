// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDhlkkqPAAyJdKYHFicbH0RCh7gI7f2PwU",
  authDomain: "alpha-d89a4.firebaseapp.com",
  projectId: "alpha-d89a4",
  storageBucket: "alpha-d89a4.appspot.com",
  messagingSenderId: "579594900151",
  appId: "1:579594900151:web:884a2c7138f78d01a97332",
  measurementId: "G-65Q8TZ4J3Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);