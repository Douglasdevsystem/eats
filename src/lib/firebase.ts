import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCMPBIAg56QD0BL36gKlN3D0mrcRDNg1Pw",
  authDomain: "appfood-e25bb.firebaseapp.com",
  databaseURL: "https://appfood-e25bb-default-rtdb.firebaseio.com",
  projectId: "appfood-e25bb",
  storageBucket: "appfood-e25bb.firebasestorage.app",
  messagingSenderId: "673458966195",
  appId: "1:673458966195:web:7a7c36d7ed0fc41ee21764"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firebase Realtime Database
export const database = getDatabase(app);