import React, { createContext, useCallback, useContext, useState } from 'react'

const AlertContext = createContext()

const TYPE_LABEL = {
  success: 'Éxito',
  error: 'Error',
  warning: 'Advertencia',
  info: 'Información',
}

const TYPE_ICON = {
  success: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  error: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-danger)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  warning: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f3ba2f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  info: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
}

export function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState([])

  const removeAlert = useCallback((id) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id))
  }, [])

  const addAlert = useCallback((message, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9)
    setAlerts((prev) => [...prev, { id, message, type }])
    setTimeout(() => removeAlert(id), 4500)
  }, [removeAlert])

  return (
    <AlertContext.Provider value={{ addAlert, removeAlert }}>
      {children}
      <div className="toast-container">
        {alerts.map((alert) => (
          <div key={alert.id} className={`toast toast-${alert.type}`}>
            <div className="toast-icon-wrapper">
              {TYPE_ICON[alert.type] || TYPE_ICON.info}
            </div>
            <div className="toast-content">
              <span className="toast-title">{TYPE_LABEL[alert.type] || 'Info'}</span>
              <span className="toast-message">{alert.message}</span>
            </div>
            <button className="toast-close" onClick={() => removeAlert(alert.id)}>&times;</button>
          </div>
        ))}
      </div>
    </AlertContext.Provider>
  )
}

export function useAlert() {
  const context = useContext(AlertContext)
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider')
  }
  return context
}
