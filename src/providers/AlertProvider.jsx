import React, { createContext, useCallback, useContext, useState } from 'react'

const AlertContext = createContext()

const TYPE_LABEL = {
  success: 'OK',
  error: 'Error',
  warning: 'Aviso',
  info: 'Info',
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
            <span className="toast-label">{TYPE_LABEL[alert.type] || 'Info'}</span>
            <span>{alert.message}</span>
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
