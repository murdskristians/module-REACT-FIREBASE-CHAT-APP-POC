import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ResetPassword from './pages/auth/ResetPassword';
import { Workspace } from './components/workspace/Workspace';

import './App.css';

import {
  type FirebaseUser,
  getCurrentUser,
  signOut,
  subscribeToAuthChanges,
} from './firebase/auth';

function App() {
  const [user, setUser] = useState<FirebaseUser | null>(() => getCurrentUser());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Initialize palette from localStorage
    const savedPalette = localStorage.getItem('app-theme-palette') || 'default';
    document.documentElement.setAttribute('data-palette', savedPalette);

    const unsubscribe = subscribeToAuthChanges((currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
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
  );
}

export default App;
