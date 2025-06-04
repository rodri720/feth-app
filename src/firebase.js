import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  serverTimestamp, 
  onSnapshot, 
  query, 
  orderBy, 
  where,
  updateDoc,
  connectFirestoreEmulator
} from "https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js";
import { 
  getStorage, 
  ref as storageRef, 
  uploadBytesResumable, 
  getDownloadURL,
  connectStorageEmulator
} from "https://www.gstatic.com/firebasejs/9.6.0/firebase-storage.js";
import { 
  getAuth,
  connectAuthEmulator,
  signInAnonymously
} from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js";
import { getFunctions, httpsCallable, connectFunctionsEmulator } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-functions.js";

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
// Añade esto ANTES de inicializar Firebase
firebase.initializeApp({
  ...firebaseConfig,
  storageBucket: 'gs://feth-gestiones-comerciales.appspot.com' // Usa formato gs://
});
// Inicialización de Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const functions = getFunctions(app);

// Conexión con emuladores en desarrollo local
if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
  connectFirestoreEmulator(db, "localhost", 18080);
  connectStorageEmulator(storage, "localhost", 9199);
  connectAuthEmulator(auth, "http://localhost:19099");
  connectFunctionsEmulator(functions, "localhost", 15001);
  console.log("Conectado a emuladores de Firebase");
}

// Función para subir archivos mediante Cloud Functions
async function uploadFileToStorage(file) {
  try {
    // Convertir archivo a base64
    const reader = new FileReader();
    
    return new Promise((resolve, reject) => {
      reader.onload = async (e) => {
        const fileData = e.target.result.split(',')[1]; // Extrae la parte base64
        
        // Llamar a la Cloud Function
        const uploadFileFunction = httpsCallable(functions, 'uploadFile');
        const result = await uploadFileFunction({
          filename: file.name,
          file: fileData,
          contentType: file.type
        });
        
        resolve(result.data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  } catch (error) {
    console.error("Error en uploadFileToStorage:", error);
    throw error;
  }
}

// Variables globales
let currentUploads = 0;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_SIMULTANEOUS_UPLOADS = 3;

// Exportar las funciones necesarias
export { 
  app,
  db, 
  storage,
  auth,
  functions,
  collection, 
  addDoc, 
  serverTimestamp, 
  onSnapshot, 
  query, 
  orderBy, 
  where,
  updateDoc,
  storageRef,
  uploadBytesResumable,
  getDownloadURL,
  uploadFileToStorage,
  signInAnonymously
};