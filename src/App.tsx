import { useEffect, useState } from 'react';

import Button from './components/Button';
import Channel from './components/Channel';

import type { FirebaseOptions } from 'firebase/app';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import './App.css';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();
auth.useDeviceLanguage();

function App() {
  const [user, setUser] = useState<firebase.User | null>(
    () => auth.currentUser
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    const provider = new firebase.auth.GoogleAuthProvider();

    try {
      await auth.signInWithPopup(provider);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  };

  const signOut = async () => {
    try {
      await firebase.auth().signOut();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error((error as Error).message);
    }
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="app-container">
      {user ? (
        <>
          <div className="app-header">
            <h1>Welcome to chat</h1>
            <Button onClick={signOut} className="header-sign-out-button">
              Sign out 21
            </Button>
          </div>
          <div className="chat-container">
            <Channel user={user} db={db} />
          </div>
        </>
      ) : (
        <div className="sign-in-container">
          <Button onClick={signInWithGoogle} className="button-primary">
            Sign in with Google
          </Button>
        </div>
      )}
    </div>
  );
}

export default App;
