import React from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/manrope/500.css';
import '@fontsource/manrope/600.css';
import '@fontsource/manrope/700.css';
import '@fontsource/manrope/800.css';
import '@fontsource-variable/inter/wght.css';
import { App } from './ui/App';
import './styles.css';
import './rich.css';
import './assistant-typography.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
