import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js";
import { 
  getStorage, ref, uploadBytesResumable, getDownloadURL 
} from "https://www.gstatic.com/firebasejs/9.6.0/firebase-storage.js";
import {  storage, ref, uploadBytesResumable, getDownloadURL } from './firebase.js';
const firebaseConfig = {
  apiKey: "AIzaSyBihPGEHqcmiDorRoCxDpsEVwfcyVPaTjU",
  authDomain: "feth-gestiones-comerciales.firebaseapp.com",
  projectId: "feth-gestiones-comerciales",
  storageBucket: "feth-gestiones-comerciales.appspot.com",
  messagingSenderId: "457629067646",
  appId: "1:457629067646:web:00fe698a9009b8dc52ab2f",
  measurementId: "G-4CG6HY8L51"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage, ref, uploadBytesResumable, getDownloadURL };