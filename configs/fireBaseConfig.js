// firebaseConfig.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyArwFkRziMGxo8Dc7CMLpXMuRXEnVUAxVk",
  authDomain: "reactnative-16868.firebaseapp.com",
  projectId: "reactnative-16868",
  storageBucket: "https://reactnative-16868-default-rtdb.firebaseio.com",
  messagingSenderId: "313297512669",
  appId: "1:313297512669:web:cdf8d8e651236e925d5334",
  measurementId: "G-D1Z2YM7E4D"
};

// Initialize Firebase App only once
const FIREBASE_APP = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth with AsyncStorage
const FIREBASE_AUTH = initializeAuth(FIREBASE_APP, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firebase Realtime Database
const database = getDatabase(FIREBASE_APP);

// Initialize Firestore
const db = getFirestore(FIREBASE_APP);

export { FIREBASE_APP, FIREBASE_AUTH, database, db };
