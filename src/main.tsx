import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from './auth/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import { Toaster } from 'sonner'
import './index.css'
import App from './App.tsx'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

createRoot(document.getElementById('root')!).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <AuthProvider>
      <NotificationProvider>
        <App />
        <Toaster richColors position="top-right" />
      </NotificationProvider>
    </AuthProvider>
  </GoogleOAuthProvider>,
)
