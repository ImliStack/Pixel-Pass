import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Root from './Root';
// Self-hosted fonts (no third-party requests)
import '@fontsource-variable/archivo/wdth.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/700.css';
import './theme/global.css';
import './components/components.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
