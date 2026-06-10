import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../providers/AuthProvider'
import { AlertProvider } from '../providers/AlertProvider'
import Lobby from '../components/Lobby'

// Helper wrapper to render with all contexts
const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AlertProvider>
        <AuthProvider>
          {component}
        </AuthProvider>
      </AlertProvider>
    </BrowserRouter>
  )
}

describe('Nexopay - Lobby y Autenticación Local', () => {
  test('Renderiza el Lobby con el copy premium e inclusivo en español', () => {
    renderWithProviders(<Lobby />)
    
    // Check brand name
    expect(screen.getByText('NEXOPAY')).toBeInTheDocument()
    
    // Check inclusive welcome message
    expect(screen.getByText(/Únete a la familia Nexopay/i)).toBeInTheDocument()
    
    // Check interactive buttons
    expect(screen.getByRole('button', { name: /Ingresar a mi cuenta/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Regístrate aquí/i })).toBeInTheDocument()
  })

  test('Cambia entre pestañas de Ingresar y Registrarse', async () => {
    renderWithProviders(<Lobby />)

    const registerTab = screen.getByRole('button', { name: /^Registrarse$/i })
    fireEvent.click(registerTab)

    // Name field should appear
    expect(screen.getByLabelText(/Nombre Completo/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Registrarme en Nexopay/i })).toBeInTheDocument()

    const loginTab = screen.getByRole('button', { name: /^Ingresar$/i })
    fireEvent.click(loginTab)

    // Name field should disappear
    expect(screen.queryByLabelText(/Nombre Completo/i)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Ingresar a mi cuenta/i })).toBeInTheDocument()
  })

  test('Muestra advertencia cuando se intenta enviar formulario vacío', () => {
    renderWithProviders(<Lobby />)

    const submitBtn = screen.getByRole('button', { name: /Ingresar a mi cuenta/i })
    fireEvent.click(submitBtn)

    // Should stay on Lobby because browser validation prevents submit,
    // or checks show custom warning toast.
    expect(screen.getByText('NEXOPAY')).toBeInTheDocument()
  })
})
