import React, { useState, useEffect } from 'react';

import Button from './components/Button';
import Channel from './components/Channel';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import './App.css';

firebase.initializeApp({
  apiKey: "AIzaSyCM1QD0mr_eVQh-Go5sjvL1Ng6uqmzVELA",
  authDomain: "fir-chat-poc-62204.firebaseapp.com",
  projectId: "fir-chat-poc-62204",
  storageBucket: "fir-chat-poc-62204.firebasestorage.app",
  messagingSenderId: "370842921024",
  appId: "1:370842921024:web:8f0f4067722a56449497a5",
  measurementId: "G-L3ZL56XDML"
});

const auth = firebase.auth();
const db = firebase.firestore();
auth.useDeviceLanguage();

function App() {

  const [user, setUser] = useState(() => auth.currentUser);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
      if (isLoading) {
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new firebase.auth.GoogleAuthProvider();

    try {
      await auth.signInWithPopup(provider);
    } catch (error) {
      console.error(error);
    }
  };

const signOut = async () => {
  try {
    await firebase.auth().signOut();
  } catch (error) {
    console.error(error.message);
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
            <Button onClick={signOut} className="header-sign-out-button">Sign out</Button>
          </div>
          <div className="chat-container">
            <Channel user={user} db={db} />
          </div>
        </>
      ) : (
        <div className="sign-in-container">
          <Button onClick={signInWithGoogle} className="button-primary">Sign in with Google</Button>
        </div>
      )}
    </div>
  );
}

export default App;
