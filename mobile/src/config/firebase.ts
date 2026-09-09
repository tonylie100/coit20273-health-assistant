import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyBzrZePlEc5v0Cu2lkNAVBjniEYRedY2Ag',
  authDomain: 'ai-powered-personal-heal-77519.firebaseapp.com',
  projectId: 'ai-powered-personal-heal-77519',
  storageBucket: 'ai-powered-personal-heal-77519.firebasestorage.app',
  messagingSenderId: '780393627712',
  appId: '1:780393627712:web:7ce34ddb85fbd768585fa5',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export default app;