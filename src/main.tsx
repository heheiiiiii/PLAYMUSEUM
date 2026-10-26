import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { AppStateProvider } from './state/AppState';
import { SoundProvider } from './state/Sound';
import { ErrorBoundary } from './components/ErrorBoundary';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AppStateProvider>
        <SoundProvider>
          <App />
        </SoundProvider>
      </AppStateProvider>
    </ErrorBoundary>
  </StrictMode>,
);
