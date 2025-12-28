
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

try {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error("Critical rendering error:", error);
  rootElement.innerHTML = `
    <div style="height: 100vh; display: flex; align-items: center; justify-content: center; font-family: sans-serif; background: #f8fafc;">
      <div style="text-align: center; padding: 2rem; background: white; border-radius: 2rem; box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);">
        <h1 style="color: #1e293b; margin-bottom: 1rem;">System Restart Required</h1>
        <p style="color: #64748b; margin-bottom: 2rem;">A temporary initialization error occurred. Please refresh.</p>
        <button onclick="window.location.reload()" style="background: #2563eb; color: white; border: none; padding: 0.75rem 2rem; border-radius: 1rem; cursor: pointer; font-weight: bold;">Reload Typen</button>
      </div>
    </div>
  `;
}
