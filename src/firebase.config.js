import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';
import { getFunctions } from 'firebase/functions';
import { getMessaging, getToken } from 'firebase/messaging';

// Configuração do Firebase
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa o Storage, Firestore, Auth, Analytics e Functions
const storage = getStorage(app);
const db = getFirestore(app);
const auth = getAuth(app);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const functions = getFunctions(app, 'us-central1');

// Inicialize o FCM
const messaging = getMessaging(app);

// Função para solicitar permissão de notificação
export const requestNotificationPermission = async () => {
  try {
    const currentToken = await getToken(messaging, { vapidKey: process.env.VAPID_KEY });
    if (currentToken) {
      console.log('FCM Token:', currentToken);
    } else {
      console.log('Nenhum token de registro disponível. Solicite permissão para gerar um.');
    }
  } catch (err) {
    console.log('Erro ao obter o token:', err);
  }
};

// Exportações
export { db, auth, storage, onAuthStateChanged, functions, analytics, messaging };
