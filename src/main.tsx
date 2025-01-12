import { createRoot } from 'react-dom/client';
import React from 'react';
import './index.css';
import App from './App.tsx';

const rootElement = document.getElementById('root')!;

if (!document.getElementById('root')) {
  throw new Error(
    'Root element not found. The app requires a root element with id "root" in your HTML.'
  );
}

const root = createRoot(rootElement as HTMLElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);