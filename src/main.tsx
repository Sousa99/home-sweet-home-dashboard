import '@sousa99/bus-catcher-components/styles.css';
import '@sousa99/fly-over-tracker-components/styles.css';
import '@sousa99/fly-over-tracker-components/index.css';
import '@sousa99/procrastinator-tracker-components/styles.css';
import '@sousa99/current-time-components/styles.css';
import '@sousa99/weather-psychic-components/styles.css';
import './index.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
