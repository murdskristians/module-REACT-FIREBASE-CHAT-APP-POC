import { useEffect, useState } from 'react';

import Button from './components/Button';
import Channel from './components/Channel';

import './App.css';

import {
  type FirebaseUser,
  getCurrentUser,
  signInWithGoogle,
  signOut,
  subscribeToAuthChanges,
} from './firebase/auth';

function App() {
  const [user, setUser] = useState<FirebaseUser | null>(() => getCurrentUser());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
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
            <Button onClick={handleSignOut} className="header-sign-out-button">
              Sign out.
            </Button>
          </div>
          <div className="chat-container">
            <Channel user={user} />
          </div>
        </>
      ) : (
        <div className="sign-in-container">
          <Button onClick={handleGoogleSignIn} className="button-primary">
            Sign in with Google
          </Button>
        </div>
      )}
    </div>
  );
}

export default App;
