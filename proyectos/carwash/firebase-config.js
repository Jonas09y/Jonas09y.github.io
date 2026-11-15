// Inicializar Firebase usando la version compat (para que funcione sin módulos)
const firebaseConfig = {
  apiKey: "AIzaSyBLv5wuON4e767C0kxCXTUEwJOwb8sbTaI",
  authDomain: "sistema-carwash-119db.firebaseapp.com",
  projectId: "sistema-carwash-119db",
  storageBucket: "sistema-carwash-119db.firebasestorage.app",
  messagingSenderId: "564701366311",
  appId: "1:564701366311:web:5e2d6dbd3b5443b7baa602",
  measurementId: "G-R64Q4XL506"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Escuchar cambios en tiempo real
let isFirstLoad = true;

db.collection('carwash').doc('data').onSnapshot(doc => {
    if (doc.exists) {
        const data = doc.data();
        
        // Guardar silenciosamente en local storage sin disparar subidas a Firebase
        localStorage.setItem('aquawash_config', JSON.stringify(data.config || {}));
        localStorage.setItem('aquawash_services', JSON.stringify(data.services || []));
        localStorage.setItem('aquawash_tire_services', JSON.stringify(data.tireServices || []));
        localStorage.setItem('aquawash_expenses', JSON.stringify(data.expenses || []));
        
        // Siempre refrescar la pantalla cuando llegan nuevos datos de Firebase
        const currentPage = localStorage.getItem('aquawash_last_page') || 'dashboard';
        if (typeof refreshPageData === 'function') {
            refreshPageData(currentPage);
        }
        isFirstLoad = false;
    }
}, error => {
    console.error("Error al sincronizar con Firebase:", error);
});
