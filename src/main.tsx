import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { LanguageProvider } from './utils/i18n';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

// Global resilience shield for external browser extensions (MetaMask, Web3 wallets, etc.)
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reasonStr = String(event?.reason?.message || event?.reason || '');
    if (
      reasonStr.toLowerCase().includes('metamask') ||
      reasonStr.toLowerCase().includes('ethereum') ||
      reasonStr.toLowerCase().includes('wallet') ||
      reasonStr.toLowerCase().includes('chrome-extension://') ||
      reasonStr.toLowerCase().includes('moz-extension://')
    ) {
      event.preventDefault();
      event.stopPropagation();
      console.warn('[AuraBio Shield] Handled third-party extension rejection:', reasonStr);
    }
  });

  window.addEventListener('error', (event) => {
    const errorStr = String(event?.message || event?.error?.message || '');
    if (
      errorStr.toLowerCase().includes('metamask') ||
      errorStr.toLowerCase().includes('ethereum') ||
      errorStr.toLowerCase().includes('wallet') ||
      errorStr.toLowerCase().includes('chrome-extension://') ||
      errorStr.toLowerCase().includes('moz-extension://')
    ) {
      event.preventDefault();
      event.stopPropagation();
      console.warn('[AuraBio Shield] Handled third-party extension error:', errorStr);
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </ErrorBoundary>
  </StrictMode>,
);

