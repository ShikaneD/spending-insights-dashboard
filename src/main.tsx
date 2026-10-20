import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import './styles/global.css';

// The backend does not exist yet: MSW answers real fetch calls in the browser.
// Set VITE_ENABLE_MOCKS=false to point the app at a real API instead.
async function enableMocking() {
  if (import.meta.env.VITE_ENABLE_MOCKS === 'false') return;
  const { worker } = await import('./mocks/browser');
  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` },
  });
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
