import firebaseCompat from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';
import 'firebase/compat/functions';

import { createDemoFirebase } from '../demo';
import firebaseConfig from './config';

/**
 * REACT_APP_DEMO_MODE=true swaps the real SDK for the in-memory implementation
 * in src/demo. Nothing else in the app changes: the same `db`, `auth`,
 * `storage` and `firebase` bindings are exported either way, so the portfolio
 * build needs no Firebase project, no API keys and no login.
 */
export const DEMO_MODE = process.env.REACT_APP_DEMO_MODE === 'true';

let firebase: typeof firebaseCompat;
let auth: firebaseCompat.auth.Auth;
let db: firebaseCompat.firestore.Firestore;
let storage: firebaseCompat.storage.Storage;
let functions: firebaseCompat.functions.Functions;

if (DEMO_MODE) {
  const demo = createDemoFirebase();

  // The demo objects implement the subset of the compat API this app touches;
  // the casts keep the rest of the codebase typed against the real SDK.
  firebase = demo.namespace as unknown as typeof firebaseCompat;
  auth = demo.auth as unknown as firebaseCompat.auth.Auth;
  db = demo.firestore as unknown as firebaseCompat.firestore.Firestore;
  storage = demo.storage as unknown as firebaseCompat.storage.Storage;
  functions = demo.functions as unknown as firebaseCompat.functions.Functions;
} else {
  if (!firebaseCompat.apps.length) {
    firebaseCompat.initializeApp(firebaseConfig);
  }

  firebase = firebaseCompat;
  auth = firebaseCompat.auth();
  db = firebaseCompat.firestore();
  storage = firebaseCompat.storage();
  functions = firebaseCompat.functions();

  auth.useDeviceLanguage();
}

export { auth, db, storage, functions };

export default firebase;
