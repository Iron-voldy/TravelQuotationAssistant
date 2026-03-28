import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// ── Suppress the benign "ResizeObserver loop" browser warning ──
// This fires when layout transitions outpace observer delivery — it is
// harmless and not fixable in userland. Hiding it keeps the dev overlay clean.
const _err = window.onerror;
window.onerror = (msg, src, line, col, err) => {
  if (typeof msg === 'string' && msg.includes('ResizeObserver loop')) return true;
  return _err ? _err(msg, src, line, col, err) : false;
};
window.addEventListener('error', (e) => {
  if (e.message && e.message.includes('ResizeObserver loop')) e.stopImmediatePropagation();
}, true);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
