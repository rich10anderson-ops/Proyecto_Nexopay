import React, { useEffect, useRef } from 'react'
import { useAuth } from '../providers/AuthProvider'
import { useAlert } from '../providers/AlertProvider'

export default function LoginPanel() {
  const googleButtonRef = useRef(null)
  const { login, loginDemo, renderGoogleButton, googleReady, googleConfigured } = useAuth()
  const { addAlert } = useAlert()

  useEffect(() => {
    if (!googleReady || !googleButtonRef.current) return
    renderGoogleButton(googleButtonRef.current)
  }, [googleReady, renderGoogleButton])

  const handleDemo = () => {
    loginDemo()
    addAlert('Entraste en modo demo. Configura VITE_GOOGLE_CLIENT_ID para Google real.', 'info')
  }

  const handleGoogle = () => {
    login()
    if (!googleConfigured) {
      addAlert('Google login no esta configurado todavia. Se activo el acceso demo.', 'warning')
    }
  }

  return (
    <section className="login-shell">
      <div className="login-hero">
        <div className="eyebrow">Mesa multi-moneda privada</div>
        <h1>NEXO PAY</h1>
        <p>
          Gestiona divisas, criptoactivos y capital operativo desde un panel sobrio,
          claro y preparado para usuarios autenticados.
        </p>
        <div className="hero-metrics">
          <div>
            <span>24/7</span>
            <small>Mercados activos</small>
          </div>
          <div>
            <span>Google</span>
            <small>Ingreso seguro</small>
          </div>
          <div>
            <span>S3</span>
            <small>Documentos listos</small>
          </div>
        </div>
      </div>

      <div className="login-card">
        <div>
          <div className="section-kicker">Acceso</div>
          <h2>Ingresa a tu dashboard</h2>
          <p className="small">
            El panel se desbloquea con Google Identity Services. En desarrollo puedes usar
            modo demo mientras agregas tu client ID.
          </p>
        </div>

        <div className="google-button-slot" ref={googleButtonRef} />

        <button className="btn btn-primary wide" onClick={handleGoogle}>
          Continuar con Google
        </button>
        <button className="btn btn-ghost wide" onClick={handleDemo}>
          Entrar en modo demo
        </button>
      </div>
    </section>
  )
}
