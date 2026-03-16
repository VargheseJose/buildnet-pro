import * as React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('SW registered: ', registration);
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}

const container = document.getElementById('root');

if (container) {
  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (e) {
    console.error("Error creating React root:", e);
    container.innerHTML = `<div style="color: white; padding: 20px; background: #020617; height: 100vh;"><h1>Initialization Error</h1><p>${e instanceof Error ? e.message : String(e)}</p></div>`;
  }
} else {
  document.body.innerHTML = '<div style="color: white; padding: 20px; background: #020617; height: 100vh;"><h1>Root element not found</h1></div>';
}
