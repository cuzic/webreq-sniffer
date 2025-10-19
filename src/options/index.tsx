import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';
import { Options } from './Options';
import { SettingsProvider } from '@/contexts/SettingsContext';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <StrictMode>
      <SettingsProvider>
        <Options />
      </SettingsProvider>
    </StrictMode>
  );
}
