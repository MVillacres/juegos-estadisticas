import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Reemplaza esto con tu config de Firebase (crea un proyecto en console.firebase.google.com)
const firebaseConfig = {
  apiKey: "AIzaSyDKrqMiA1YthBMhypriieYHG72b2EBWUc4",
  authDomain: "juegos-estadisticas.firebaseapp.com",
  projectId: "juegos-estadisticas",
  storageBucket: "juegos-estadisticas.firebasestorage.app",
  messagingSenderId: "891760748084",
  appId: "1:891760748084:web:2b7340ddb1bf7d677a4c61",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Firestore
export const db = getFirestore(app);

// Inicializar Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Inicializar Storage
export const storage = getStorage(app);

export default app;
