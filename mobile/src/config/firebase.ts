import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBUlk5zOQkwDMaK89LGd220Ct7Je4CLXQ4",
  authDomain: "coit20273-health-assistant.firebaseapp.com",
  projectId: "coit20273-health-assistant",
  storageBucket: "coit20273-health-assistant.firebasestorage.app",
  messagingSenderId: "936629856846",
  appId: "1:936629856846:web:fe263b84bffa5fbe3e711f",
  measurementId: "G-RWJ7RBQTJH"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export default app;