import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../providers/AuthProvider'
import { useAlert } from '../providers/AlertProvider'
import { useNavigate } from 'react-router-dom'

export default function Lobby() {
  const googleButtonRef = useRef(null)
  const [activeTab, setActiveTab] = useState('login') // 'login' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const { login, loginDemo, loginWithCredentials, registerAccount, renderGoogleButton, googleReady, googleConfigured, user } = useAuth()
  const { addAlert } = useAlert()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  useEffect(() => {
    if (!googleReady || !googleButtonRef.current) return
    renderGoogleButton(googleButtonRef.current)
  }, [googleReady, renderGoogleButton, activeTab])

  const handleDemo = () => {
    loginDemo()
    addAlert('Accediendo en modo demo. Configura VITE_GOOGLE_CLIENT_ID para Google real.', 'info')
  }

  const handleGoogle = () => {
    login()
    if (!googleConfigured) {
      addAlert('Inicio con Google no configurado en entorno de desarrollo. Acceso demo habilitado.', 'warning')
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (activeTab === 'login') {
      if (!email || !password) {
        addAlert('Por favor completa todos los campos.', 'warning')
        return
      }
      loginWithCredentials(email, password, addAlert)
    } else {
      if (!name || !email || !password) {
        addAlert('Por favor completa todos los campos.', 'warning')
        return
      }
      if (password.length < 8) {
        addAlert('La contraseña debe tener al menos 8 caracteres.', 'warning')
        return
      }
      const success = registerAccount(name, email, password, addAlert)
      if (success) {
        setActiveTab('login')
        setPassword('')
      }
    }
  }

  return (
    <section className="login-shell">
      <div className="login-hero">
        <div className="eyebrow" style={{ color: 'var(--accent-primary)', fontWeight: '900' }}>
          Mesa de Dinero Digital Premium
        </div>
        <h1>NEXOPAY</h1>
        <p style={{ fontSize: '15px', color: '#c0c8db', lineHeight: '1.6', marginTop: '16px' }}>
          <strong>Únete a la familia Nexopay.</strong> Aquí no solo gestionas capital global, divisas y criptoactivos;
          también formas parte de un ecosistema diseñado para impulsar la inclusión, el desarrollo colectivo y
          la libertad financiera de las mentes más ambiciosas del continente.
        </p>
        <p style={{ fontSize: '13.5px', color: '#8a99ad', lineHeight: '1.6', marginTop: '8px' }}>
          Nuestra tecnología de máxima seguridad y arquitectura distribuida está creada para conectar tus operaciones
          con las mesas de cambio más competitivas del planeta, asegurando que cada miembro de nuestra familia obtenga
          el trato de prestigio y exclusividad que se merece.
        </p>
        <div className="hero-metrics" style={{ marginTop: '24px' }}>
          <div>
            <span>24/7</span>
            <small>Transacciones globales</small>
          </div>
          <div>
            <span>Google</span>
            <small>Autenticación segura</small>
          </div>
          <div>
            <span>100%</span>
            <small>Inclusivo y premium</small>
          </div>
        </div>
      </div>

      <div className="login-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <div className="section-kicker">Portal de acceso</div>
          <h2>{activeTab === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}</h2>
          <p className="small">
            {activeTab === 'login'
              ? 'Ingresa tus credenciales registradas o continúa usando las redes sociales.'
              : 'Completa tus datos para registrarte en la plataforma y ser parte de esta familia.'}
          </p>
        </div>

        {/* Form Selector Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--panel-border)', marginBottom: '8px' }}>
          <button
            className="menu-item-neon"
            style={{
              flex: 1,
              textAlign: 'center',
              borderBottom: activeTab === 'login' ? '2px solid var(--accent-primary)' : 'none',
              color: activeTab === 'login' ? 'var(--text-primary)' : 'var(--text-secondary)',
              borderRadius: '8px 8px 0 0',
              padding: '10px'
            }}
            onClick={() => {
              setActiveTab('login')
              setEmail('')
              setPassword('')
            }}
          >
            Ingresar
          </button>
          <button
            className="menu-item-neon"
            style={{
              flex: 1,
              textAlign: 'center',
              borderBottom: activeTab === 'register' ? '2px solid var(--accent-primary)' : 'none',
              color: activeTab === 'register' ? 'var(--text-primary)' : 'var(--text-secondary)',
              borderRadius: '8px 8px 0 0',
              padding: '10px'
            }}
            onClick={() => {
              setActiveTab('register')
              setEmail('')
              setPassword('')
              setName('')
            }}
          >
            Registrarse
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {activeTab === 'register' && (
            <div className="form-group">
              <label htmlFor="name-input">Nombre Completo</label>
              <input
                id="name-input"
                type="text"
                placeholder="Ej. Juan Pérez"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="neon-input"
                required
              />
            </div>
          )}
          <div className="form-group">
            <label htmlFor="email-input">Correo Electrónico</label>
            <input
              id="email-input"
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="neon-input"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password-input">Contraseña</label>
            <input
              id="password-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="neon-input"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary wide" style={{ marginTop: '10px' }}>
            {activeTab === 'login' ? 'Ingresar a mi cuenta' : 'Registrarme en Nexopay'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '8px 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--panel-border)' }} />
          <span className="small" style={{ margin: '0 10px', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>O continuar con</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--panel-border)' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="google-button-slot" ref={googleButtonRef} style={{ display: 'none' }} />
          <button className="btn btn-ghost wide" onClick={handleGoogle} style={{ gap: '10px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
            </svg>
            Google Identity
          </button>
          {activeTab === 'login' ? (
            <div style={{ textAlign: 'center', marginTop: '12px' }}>
              <span className="small" style={{ color: 'var(--text-secondary)' }}>¿Aún no tienes cuenta? </span>
              <button
                type="button"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--accent-primary)',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '12.5px',
                  padding: '0',
                  textDecoration: 'underline'
                }}
                onClick={() => setActiveTab('register')}
              >
                Regístrate aquí
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', marginTop: '12px' }}>
              <span className="small" style={{ color: 'var(--text-secondary)' }}>¿Ya eres parte de la familia? </span>
              <button
                type="button"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--accent-primary)',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '12.5px',
                  padding: '0',
                  textDecoration: 'underline'
                }}
                onClick={() => setActiveTab('login')}
              >
                Inicia sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
