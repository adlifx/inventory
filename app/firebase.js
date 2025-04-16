// src/lib/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
// Replace with your actual Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyBwX4IHFtrEa8FOu1ZxTaELpAmFmi2gnSA",
    authDomain: "product-inventory-app-a39a1.firebaseapp.com",
    projectId: "product-inventory-app-a39a1",
    storageBucket: "product-inventory-app-a39a1.firebasestorage.app",
    messagingSenderId: "415715131390",
    appId: "1:415715131390:web:0b22454934e34706d68aaf",
    measurementId: "G-BCCQZ68TGH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };