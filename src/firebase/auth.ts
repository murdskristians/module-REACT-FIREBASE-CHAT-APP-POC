import type firebaseCompat from 'firebase/compat/app';

import firebase, { auth } from './index';
import { upsertUserProfile } from './users';

export type FirebaseUser = firebaseCompat.User;

export const getCurrentUser = (): FirebaseUser | null => auth.currentUser;

export const subscribeToAuthChanges = (
  listener: (user: FirebaseUser | null) => void
) => auth.onAuthStateChanged(listener);

export const signInAnonymously = () => auth.signInAnonymously();

export const signInWithGoogle = async () => {
  const provider = new firebase.auth.GoogleAuthProvider();

  const credential = await auth.signInWithPopup(provider);

  if (credential.user) {
    await upsertUserProfile(credential.user);
  }

  return credential;
};

export const signInWithEmailPassword = async (email: string, password: string) => {
  const credential = await auth.signInWithEmailAndPassword(email, password);

  if (credential.user) {
    await upsertUserProfile(credential.user);
  }

  return credential;
};

export const signUpWithEmailPassword = async (email: string, password: string) => {
  const credential = await auth.createUserWithEmailAndPassword(email, password);

  if (credential.user) {
    await credential.user.updateProfile({ displayName: credential.user.displayName ?? email });
    await upsertUserProfile(credential.user);
  }

  return credential;
};

export const resetPassword = async (email: string) => {
  return auth.sendPasswordResetEmail(email);
};

export const signOut = () => auth.signOut();
