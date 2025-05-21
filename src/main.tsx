
import { createRoot } from 'react-dom/client'
import React from 'react'; // Standard React import
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
