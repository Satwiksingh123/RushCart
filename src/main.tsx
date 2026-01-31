import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Force unregister old service workers and clear all caches
if ('serviceWorker' in navigator) {
  // First, unregister ALL service workers
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.unregister();
    });
  });

  // Clear ALL caches (including lovable domain caches)
  if ('caches' in window) {
    caches.keys().then((cacheNames) => {
      cacheNames.forEach((cacheName) => {
        caches.delete(cacheName);
      });
    });
  }

  // Register new service worker after clearing old ones
  window.addEventListener('load', () => {
    setTimeout(() => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration.scope);
          // Force immediate activation
          registration.update();
        })
        .catch((error) => {
          console.log('SW registration failed:', error);
        });
    }, 100);
  });
}

createRoot(document.getElementById("root")!).render(<App />);
