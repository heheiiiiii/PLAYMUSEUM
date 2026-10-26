import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { AppStateProvider } from './state/AppState';
import { SoundProvider } from './state/Sound';
import { ActivityProvider } from './state/Activity';
import { VenueProvider } from './state/Venue';
import { ErrorBoundary } from './components/ErrorBoundary';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <VenueProvider>
        {(venueId) => (
          <AppStateProvider key={venueId}>
            <ActivityProvider>
              <SoundProvider>
                <App />
              </SoundProvider>
            </ActivityProvider>
          </AppStateProvider>
        )}
      </VenueProvider>
    </ErrorBoundary>
  </StrictMode>,
);
