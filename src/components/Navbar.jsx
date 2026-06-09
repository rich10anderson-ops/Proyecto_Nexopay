import React from 'react'
import { useAuth } from '../providers/AuthProvider'
import { useAlert } from '../providers/AlertProvider'

export default function Navbar() {
  const { user, login, logout } = useAuth()
  const { addAlert } = useAlert()

  const handleLogin = () => {
    login()
    addAlert('Bienvenido de nuevo a NEXO PAY.', 'success')
  }

  const handleLogout = () => {
    logout()
    addAlert('Has cerrado sesion correctamente.', 'info')
  }

  return (
    <header className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className="brand smoky-text">NEXO PAY</div>
        <div className="small badge">Mercados · Divisas</div>
      </div>
      <div className="nav-actions">
        {!user ? (
          <button className="btn btn-primary" onClick={handleLogin}>
            Ingresar con Google
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {user.picture ? <img className="nav-avatar" src={user.picture} alt="" /> : null}
            <span className="small">Hola, {user.name}</span>
            <button className="btn btn-ghost" onClick={handleLogout} style={{ padding: '6px 10px', fontSize: '12px' }}>
              Salir
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
