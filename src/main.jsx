import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { CurrencyProvider } from './providers/CurrencyProvider'
import { AuthProvider } from './providers/AuthProvider'
import { AlertProvider } from './providers/AlertProvider'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AlertProvider>
      <AuthProvider>
        <CurrencyProvider>
          <App />
        </CurrencyProvider>
      </AuthProvider>
    </AlertProvider>
  </React.StrictMode>
)
