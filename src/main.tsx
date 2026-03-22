import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {ProjectProvider} from './contexts/ProjectContext';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ProjectProvider>
      <App />
    </ProjectProvider>
  </StrictMode>,
);
