import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Inicializando Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Configurar persistência explicitamente
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("✅ Persistência ativada e configurada! auth: ");
  })
  .catch(error => {
    console.error("❌ Erro ao configurar persistência:", error);
  });

export { auth };