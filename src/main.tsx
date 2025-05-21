
import { createRoot } from 'react-dom/client'
import * as React from 'react'; // Updated React import
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <App />
);
