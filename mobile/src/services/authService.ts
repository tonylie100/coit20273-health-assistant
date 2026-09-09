import { auth } from '../config/firebase';

export async function getFirebaseIdToken(): Promise<string> {
  const user = auth.currentUser;

  if (!user) {
    throw new Error('User is not authenticated.');
  }

  return user.getIdToken();
}