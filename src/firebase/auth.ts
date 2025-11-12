import type firebaseCompat from 'firebase/compat/app';

import firebase, { auth } from './index';

export type FirebaseUser = firebaseCompat.User;

export const getCurrentUser = (): FirebaseUser | null => auth.currentUser;

export const subscribeToAuthChanges = (
  listener: (user: FirebaseUser | null) => void
) => auth.onAuthStateChanged(listener);

export const signInWithGoogle = async () => {
  const provider = new firebase.auth.GoogleAuthProvider();

  return auth.signInWithPopup(provider);
};

export const signOut = () => auth.signOut();
