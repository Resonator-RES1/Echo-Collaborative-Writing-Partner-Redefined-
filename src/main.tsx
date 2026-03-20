import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { SyncProvider } from './contexts/SyncContext';
import App from './App.tsx';
import './index.css';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy-client-id';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <SyncProvider>
        <App />
      </SyncProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
);
