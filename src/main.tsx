import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Seamless migration of any legacy localStorage keys to school_*
try {
  if (typeof window !== "undefined" && window.localStorage) {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("magno_")) {
        const newKey = key.replace(/^magno_/, "school_");
        if (localStorage.getItem(newKey) === null) {
          const val = localStorage.getItem(key);
          if (val !== null) {
            localStorage.setItem(newKey, val);
          }
        }
      }
    }
  }
} catch {
  // Silent fallback if storage is restricted
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
