import React from 'react';
import ReactDOM from 'react-dom/client';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import App from './App.jsx';
import './index.css';

// For local development over HTTP, we use a public HTTPS manifest URL to prevent wallets throwing SSL/fetch errors.
const manifestUrl = 'https://ton-connect.github.io/demo-dapp/tonconnect-manifest.json';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <App />
    </TonConnectUIProvider>
  </React.StrictMode>
);
