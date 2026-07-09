import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ResetPassword from './pages/auth/ResetPassword';
import { Workspace } from './components/workspace/Workspace';
import { NotificationProvider } from './components/notifications/NotificationProvider';

import './App.css';

import {
  type FirebaseUser,
  getCurrentUser,
  signInAnonymously,
  signOut,
  subscribeToAuthChanges,
} from './firebase/auth';
import { ensureDemoData } from './firebase/demoSeed';

function App() {
  const [user, setUser] = useState<FirebaseUser | null>(() => getCurrentUser());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Initialize palette and theme from localStorage
    const savedPalette = localStorage.getItem('app-theme-palette') || 'default';
    const savedTheme = localStorage.getItem('app-theme-mode') || 'light';
    document.documentElement.setAttribute('data-palette', savedPalette);
    document.documentElement.setAttribute('data-theme', savedTheme);

    const unsubscribe = subscribeToAuthChanges((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setIsLoading(false);
        // Seed a demo conversation for anonymous (guest) visitors so the
        // chat isn't empty. No-op for real signed-in accounts.
        if (currentUser.isAnonymous) {
          void ensureDemoData(currentUser);
        }
      } else {
        // No user: sign in as an anonymous guest so the demo needs no login.
        // Requires "Anonymous" enabled in Firebase Auth for this project.
        void signInAnonymously().catch((error) => {
          // eslint-disable-next-line no-console
          console.error('Anonymous sign-in failed:', error);
          setIsLoading(false);
        });
      }
    });

    return unsubscribe;
  }, []);

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
    <NotificationProvider>
      <BrowserRouter>
        <Routes>
        {/* Auth routes */}
        <Route
          path="/auth/login"
          element={user ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          path="/auth/register"
          element={user ? <Navigate to="/" replace /> : <Register />}
        />
        <Route
          path="/auth/reset-password"
          element={user ? <Navigate to="/" replace /> : <ResetPassword />}
        />

        {/* Protected routes */}
        <Route path="/" element={user ? <Workspace user={user} onSignOut={handleSignOut} /> : <Navigate to="/auth/login" replace />} />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </NotificationProvider>
  );
}

export default App;
