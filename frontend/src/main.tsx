import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { I18nextProvider } from 'react-i18next';
import i18n from '@i18n/config';
import App from './App';
import { ToastContainer } from './components/Toast/ToastContainer';
import '@styles/global.css';

// Activate premium theme
document.documentElement.setAttribute('data-theme', 'premium');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <I18nextProvider i18n={i18n}>
        <App />
        <ToastContainer />
      </I18nextProvider>
    </HelmetProvider>
  </React.StrictMode>
);
