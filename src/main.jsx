import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { CurrencyProvider } from './providers/CurrencyProvider'
import { AuthProvider } from './providers/AuthProvider'
import { AlertProvider } from './providers/AlertProvider'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AlertProvider>
        <AuthProvider>
          <CurrencyProvider>
            <App />
          </CurrencyProvider>
        </AuthProvider>
      </AlertProvider>
    </BrowserRouter>
  </React.StrictMode>
)
