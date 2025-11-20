import React from 'react';
import ReactDOM from 'react-dom/client';

import './index.css';
import './styles/theme.css';
import App from './App';

// Export components for use in other applications
export { Workspace } from './components/workspace/Workspace';

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

