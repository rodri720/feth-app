// panel.js
const firebaseConfig = {
    apiKey: "TU_API_KEY",
    authDomain: "TU_PROYECTO.firebaseapp.com",
    storageBucket: "TU_STORAGE_BUCKET.appspot.com"
};

// Inicializa Firebase
const app = firebase.initializeApp(firebaseConfig);
const storage = firebase.storage();

// Función para subir archivos
async function subirArchivo(file) {
    const storageRef = storage.ref(`vehiculos/${Date.now()}_${file.name}`);
    await storageRef.put(file);
    const url = await storageRef.getDownloadURL();
    console.log("URL de descarga:", url);
    return url;
}

// Evento al seleccionar archivo
document.getElementById("miInputArchivo").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
        subirArchivo(file)
            .then(url => alert("Archivo subido. URL: " + url))
            .catch(error => console.error("Error:", error));
    }
});