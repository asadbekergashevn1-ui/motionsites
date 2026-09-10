import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AppProvider } from './context/AppContext';

/* Ionic yadro uslublari (majburiy) */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Ionic yordamchi uslublari */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/text-alignment.css';

/* Ionic dark palette (sinf orqali boshqariladi) */
import '@ionic/react/css/palettes/dark.class.css';

/* Ilova mavzusi va global uslublar */
import './theme/variables.css';
import './theme/global.css';
import './theme/components.css';

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);
