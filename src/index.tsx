// Polyfills for WebRTC libraries
import { Buffer } from 'buffer';
import process from 'process';

// Make them globally available
(window as any).Buffer = Buffer;
(window as any).process = process;

import React from 'react';
import ReactDOM from 'react-dom/client';

import './index.css';
import './styles/theme.css';
import App from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element with id "root" not found');
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

