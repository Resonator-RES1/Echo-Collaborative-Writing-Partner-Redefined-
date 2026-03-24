import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {ProjectProvider} from './contexts/ProjectContext';
import {LoreProvider} from './contexts/LoreContext';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ProjectProvider>
      <LoreProvider>
        <App />
      </LoreProvider>
    </ProjectProvider>
  </StrictMode>,
);
