import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js";
import { 
  getFirestore, collection, addDoc, serverTimestamp, 
  onSnapshot, query, orderBy 
} from "https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js";
import { 
  getStorage, ref, uploadBytesResumable, listAll, getDownloadURL 
} from "https://www.gstatic.com/firebasejs/9.6.0/firebase-storage.js";

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
const storage = getStorage(app);
// Inicializa Firebase
firebase.initializeApp(firebaseConfig);

// Variables globales
let currentUploads = 0;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_SIMULTANEOUS_UPLOADS = 3;

// Funcionalidad del formulario
document.addEventListener('DOMContentLoaded', () => {
  const propertyForm = document.getElementById('propertyForm');
  
  if (propertyForm) {
    propertyForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const title = document.getElementById('propertyTitle').value;
      const description = document.getElementById('propertyDesc').value;
      const price = document.getElementById('propertyPrice').value;
      const files = document.getElementById('propertyImages').files;

      // Validaciones básicas
      if (!title || !description || files.length === 0) {
        showAlert('Por favor complete todos los campos', 'danger');
        return;
      }

      try {
        // Mostrar loader
        toggleLoader(true);
        
        // 1. Verificar tamaño de archivos
        for (let file of files) {
          if (file.size > MAX_FILE_SIZE) {
            throw new Error(`El archivo ${file.name} excede el límite de 5MB`);
          }
        }

        // 2. Guardar datos en Firestore
        const docRef = await addDoc(collection(db, "properties"), {
          title,
          description,
          price: Number(price),
          createdAt: serverTimestamp(),
          status: 'pending',
          images: []
        });

        // 3. Subir imágenes con control de concurrencia
        await uploadImages(files, docRef.id);
        
        showAlert('✅ Propiedad publicada exitosamente', 'success');
        propertyForm.reset();
      } catch (error) {
        console.error("Error al publicar:", error);
        showAlert(`❌ Error: ${error.message}`, 'danger');
      } finally {
        toggleLoader(false);
      }
    });
  }

  // Cargar propiedades existentes
  loadProperties();
});

// Función para subir imágenes con control de progreso
async function uploadImages(files, propertyId) {
  const uploadPromises = [];
  const uploadContainer = document.getElementById('uploadProgressContainer');
  
  // Limpiar contenedor de progreso
  if (uploadContainer) uploadContainer.innerHTML = '';

  // Crear elementos de progreso para cada archivo
  const progressElements = {};
  Array.from(files).forEach(file => {
    progressElements[file.name] = createProgressElement(file.name);
    if (uploadContainer) {
      uploadContainer.appendChild(progressElements[file.name].container);
    }
  });

  // Función para subir un archivo individual
  const uploadFile = async (file) => {
    const storageRef = ref(storage, `properties/${propertyId}/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    return new Promise((resolve, reject) => {
      uploadTask.on('state_changed',
        (snapshot) => {
          // Actualizar progreso
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          progressElements[file.name].progressBar.style.width = `${progress}%`;
          progressElements[file.name].progressText.textContent = `${Math.round(progress)}%`;
        },
        (error) => {
          progressElements[file.name].progressBar.classList.add('bg-danger');
          reject(error);
        },
        async () => {
          // Obtener URL y actualizar documento
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  };

  // Control de subidas simultáneas
  const batchSize = Math.min(MAX_SIMULTANEOUS_UPLOADS, files.length);
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = Array.from(files).slice(i, i + batchSize);
    const batchPromises = batch.map(file => uploadFile(file));
    uploadPromises.push(...batchPromises);
    await Promise.all(batchPromises);
  }

  return Promise.all(uploadPromises);
}

// Función para crear elementos de progreso
function createProgressElement(filename) {
  const container = document.createElement('div');
  container.className = 'mb-2';
  
  const filenameElement = document.createElement('small');
  filenameElement.className = 'd-block text-muted';
  filenameElement.textContent = filename;
  
  const progressWrapper = document.createElement('div');
  progressWrapper.className = 'progress';
  
  const progressBar = document.createElement('div');
  progressBar.className = 'progress-bar progress-bar-striped progress-bar-animated';
  progressBar.style.width = '0%';
  progressBar.setAttribute('aria-valuenow', '0');
  progressBar.setAttribute('aria-valuemin', '0');
  progressBar.setAttribute('aria-valuemax', '100');
  
  const progressText = document.createElement('small');
  progressText.className = 'text-end d-block';
  progressText.textContent = '0%';
  
  progressWrapper.appendChild(progressBar);
  container.appendChild(filenameElement);
  container.appendChild(progressWrapper);
  container.appendChild(progressText);
  
  return { container, progressBar, progressText };
}

// Cargar propiedades existentes
async function loadProperties() {
  const propertiesList = document.getElementById('propertiesList');
  if (!propertiesList) return;

  try {
    propertiesList.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"></div></div>';
    
    const q = query(collection(db, "properties"), orderBy("createdAt", "desc"));
    
    onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) {
        propertiesList.innerHTML = '<div class="alert alert-info">No hay propiedades publicadas aún</div>';
        return;
      }
      
      propertiesList.innerHTML = '<h3 class="mb-4">Propiedades Publicadas</h3>';
      
      for (const doc of snapshot.docs) {
        const property = doc.data();
        const imagesRef = ref(storage, `properties/${doc.id}`);
        
        try {
          const images = await listAll(imagesRef);
          let imagesHTML = '';
          
          // Obtener URLs de las imágenes
          const imageUrls = await Promise.all(
            images.items.map(item => getDownloadURL(item))
          );
          
          // Crear HTML para las imágenes
          imagesHTML = imageUrls.map(url => `
            <img src="${url}" class="img-thumbnail m-2" style="height: 120px; cursor: pointer" 
                 onclick="showImageModal('${url}')">
          `).join('');
          
          // Formatear precio
          const formattedPrice = property.price ? 
            `$${property.price.toLocaleString()}` : 'Consultar precio';
          
          propertiesList.innerHTML += `
            <div class="card mb-4 shadow-sm">
              <div class="card-body">
                <div class="d-flex justify-content-between">
                  <h5 class="card-title">${property.title}</h5>
                  <span class="badge bg-primary">${formattedPrice}</span>
                </div>
                <p class="card-text">${property.description}</p>
                <div class="d-flex flex-wrap">${imagesHTML}</div>
                <small class="text-muted d-block mt-2">
                  Publicado el ${new Date(property.createdAt?.toDate()).toLocaleDateString()}
                </small>
              </div>
            </div>
          `;
        } catch (error) {
          console.error("Error cargando imágenes:", error);
          propertiesList.innerHTML += `
            <div class="alert alert-warning">
              Error cargando imágenes para: ${property.title}
            </div>
          `;
        }
      }
    });
  } catch (error) {
    console.error("Error cargando propiedades:", error);
    propertiesList.innerHTML = '<div class="alert alert-danger">Error al cargar las propiedades</div>';
  }
}

// Mostrar modal de imagen (añadir esto al HTML)
window.showImageModal = (imageUrl) => {
  const modalHTML = `
    <div class="modal fade" id="imageModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-body text-center">
            <img src="${imageUrl}" class="img-fluid">
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  const modal = new bootstrap.Modal(document.getElementById('imageModal'));
  modal.show();
  
  // Limpiar modal después de cerrar
  document.getElementById('imageModal').addEventListener('hidden.bs.modal', () => {
    document.getElementById('imageModal').remove();
  });
};

// Helper: Mostrar alertas
function showAlert(message, type) {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
  alertDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  
  const container = document.getElementById('alertsContainer') || document.body;
  container.prepend(alertDiv);
  
  setTimeout(() => {
    alertDiv.classList.remove('show');
    setTimeout(() => alertDiv.remove(), 150);
  }, 5000);
}

// Helper: Mostrar/ocultar loader
function toggleLoader(show) {
  const loader = document.getElementById('formLoader');
  const submitBtn = document.getElementById('submitBtn');
  
  if (loader && submitBtn) {
    if (show) {
      loader.classList.remove('d-none');
      submitBtn.disabled = true;
    } else {
      loader.classList.add('d-none');
      submitBtn.disabled = false;
    }
  }
}