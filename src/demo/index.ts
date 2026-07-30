/**
 * Assembles an object shaped like the `firebase` compat namespace, backed by
 * the in-memory implementations in this folder.
 *
 * src/firebase/index.ts hands this back instead of the real SDK when
 * REACT_APP_DEMO_MODE=true, so every other module keeps importing `db`, `auth`,
 * `storage` and `firebase` exactly as before.
 */

import { DemoAuth } from './auth';
import { DemoFieldValue, DemoFirestore, DemoTimestamp } from './firestore';
import { seedDemoContacts } from './seed';
import { DemoStorage } from './storage';

class DemoGoogleAuthProvider {
  static readonly PROVIDER_ID = 'google.com';

  readonly providerId = 'google.com';

  addScope(): this {
    return this;
  }

  setCustomParameters(): this {
    return this;
  }
}

export function createDemoFirebase() {
  const firestore = new DemoFirestore();
  const auth = new DemoAuth();
  const storage = new DemoStorage();

  seedDemoContacts(firestore);

  const firestoreNamespace: any = () => firestore;
  firestoreNamespace.Timestamp = DemoTimestamp;
  firestoreNamespace.FieldValue = DemoFieldValue;

  const authNamespace: any = () => auth;
  authNamespace.GoogleAuthProvider = DemoGoogleAuthProvider;

  const storageNamespace: any = () => storage;

  const functions = {
    httpsCallable: () => async () => {
      throw new Error('Cloud Functions are unavailable in the offline demo.');
    },
  };

  const namespace: any = {
    apps: [{ name: '[DEMO]' }],
    initializeApp: () => namespace.apps[0],
    firestore: firestoreNamespace,
    auth: authNamespace,
    storage: storageNamespace,
    functions: () => functions,
  };

  return { namespace, firestore, auth, storage, functions };
}
