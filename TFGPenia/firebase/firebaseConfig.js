import { initializeApp } from 'firebase/app';
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAtVLMGVqnjc4I9KpmNHnfRt-MPKKQr4dE",
  authDomain: "tfgpenias.firebaseapp.com",
  databaseURL: "https://tfgpenias-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "tfgpenias",
  storageBucket: "tfgpenias.firebasestorage.app",
  messagingSenderId: "605661828090",
  appId: "1:605661828090:web:78ee740aeccb5e2e7b8a43",
  measurementId: "G-G97VN4FFWX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { db, auth };