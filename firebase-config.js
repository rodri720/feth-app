// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "FETH-GESTIONES-COMERCIALES.firebaseapp.com",
  projectId: "FETH-GESTIONES-COMERCIALES",
  storageBucket: "FETH-GESTIONES-COMERCIALES.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "1:457629067646:web:00fe698a9009b8dc52ab2f"
};

export const app = initializeApp(firebaseConfig);