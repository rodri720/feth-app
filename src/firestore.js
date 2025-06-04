import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js";
import { 
  getFirestore, collection, addDoc, serverTimestamp, 
  onSnapshot, query, orderBy, where, updateDoc
} from "https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js";
import { db } from './firebase.js';
// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBihPGEHqcmiDorRoCxDpsEVwfcyVPaTjU",
  authDomain: "feth-gestiones-comerciales.firebaseapp.com",
  projectId: "feth-gestiones-comerciales",
  storageBucket: "feth-gestiones-comerciales.appspot.com",
  messagingSenderId: "457629067646",
  appId: "1:457629067646:web:00fe698a9009b8dc52ab2f",
  measurementId: "G-4CG6HY8L51"
};

// Inicialización de Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Exportar las funciones necesarias
export { 
  db, 
  collection, 
  addDoc, 
  serverTimestamp, 
  onSnapshot, 
  query, 
  orderBy, 
  where, 
  updateDoc 
};