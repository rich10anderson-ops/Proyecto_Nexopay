import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AuthContext = createContext()
const STORAGE_KEY = 'nexopay:user'

function decodeJwtPayload(token) {
  try {
    const payload = token.split('.')[1]
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decodeURIComponent(json.split('').map((char) => {
      return `%${(`00${char.charCodeAt(0).toString(16)}`).slice(-2)}`
    }).join('')))
  } catch (error) {
    console.warn('No fue posible leer el perfil de Google.', error)
    return null
  }
}

function normalizeGoogleUser(payload) {
  return {
    id: payload.sub,
    name: payload.name || payload.given_name || 'Usuario NEXOPAY',
    email: payload.email,
    picture: payload.picture,
    provider: 'google',
    verified: Boolean(payload.email_verified),
    signedAt: new Date().toISOString(),
  }
}

export function AuthProvider({children}){
  const [user,setUser]=useState(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY)
      return cached ? JSON.parse(cached) : null
    } catch {
      return null
    }
  })
  const [googleReady, setGoogleReady] = useState(false)
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  useEffect(() => {
    if (!user) {
      localStorage.removeItem(STORAGE_KEY)
      return
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  }, [user])

  useEffect(() => {
    if (!googleClientId) return

    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]')
    if (existing) {
      if (window.google?.accounts?.id) setGoogleReady(true)
      else existing.addEventListener('load', () => setGoogleReady(true), { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => setGoogleReady(true)
    script.onerror = () => setGoogleReady(false)
    document.head.appendChild(script)
  }, [googleClientId])

  useEffect(() => {
    if (!googleReady || !googleClientId || !window.google?.accounts?.id) return

    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: (response) => {
        const payload = decodeJwtPayload(response.credential)
        if (payload) setUser(normalizeGoogleUser(payload))
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    })
  }, [googleReady, googleClientId])

  function loginDemo(){
    setUser({
      id: 'demo-user',
      name: 'Usuario NEXOPAY',
      email: 'demo@nexopay.local',
      provider: 'demo',
      verified: true,
      signedAt: new Date().toISOString(),
    })
  }

  function login(){
    if (!googleClientId || !window.google?.accounts?.id) {
      loginDemo()
      return
    }
    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        loginDemo()
      }
    })
  }

  function renderGoogleButton(container) {
    if (!container || !googleClientId || !window.google?.accounts?.id) return false
    container.innerHTML = ''
    window.google.accounts.id.renderButton(container, {
      theme: 'outline',
      size: 'large',
      shape: 'rectangular',
      text: 'continue_with',
      width: Math.min(container.clientWidth || 320, 360),
      locale: 'es',
    })
    return true
  }

  function logout(){
    if (window.google?.accounts?.id) window.google.accounts.id.disableAutoSelect()
    setUser(null)
  }

  const value = useMemo(() => ({
    user,
    login,
    loginDemo,
    logout,
    renderGoogleButton,
    googleReady,
    googleConfigured: Boolean(googleClientId),
  }), [user, googleReady, googleClientId])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(){ return useContext(AuthContext) }
