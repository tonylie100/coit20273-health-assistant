
import {
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { auth } from '../config/firebase';

function waitForCurrentUser(): Promise<User | null> {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe();
        resolve(user);
      },
      (error) => {
        unsubscribe();
        reject(error);
      },
    );
  });
}

export async function getFirebaseIdToken(): Promise<string> {
  const user = auth.currentUser ?? await waitForCurrentUser();

  if (!user) {
    throw new Error(
      'No Firebase user is signed in. Please sign in and try again.',
    );
  }

  return user.getIdToken();
}