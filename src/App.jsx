import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import LeftPanel from './components/LeftPanel'
import RightPanel from './components/RightPanel'
import TradePanel from './components/TradePanel'
import DashboardPanel from './components/DashboardPanel'
import Lobby from './components/Lobby'
import FloatingSymbols from './components/FloatingSymbols'
import ProtectedRoute from './components/ProtectedRoute'
import ConverterPanel from './components/ConverterPanel'
import InvestmentsPanel from './components/InvestmentsPanel'
import { useAuth } from './providers/AuthProvider'

export default function App() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('Dashboard')

  return (
    <div className="app-root soft-finance-bg">
      <FloatingSymbols />
      <Navbar />
      <Routes>
        {/* Lobby Route */}
        <Route path="/" element={<Lobby />} />

        {/* Authenticated Dashboard Route */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div className="layout">
                <LeftPanel activeTab={activeTab} setActiveTab={setActiveTab} />
                <main className="main-area dashboard-stack">
                  {activeTab === 'Dashboard' && (
                    <>
                      <DashboardPanel viewMode="all" />
                      <TradePanel />
                    </>
                  )}
                  {activeTab === 'Administrar dinero' && (
                    <DashboardPanel viewMode="all" />
                  )}
                  {activeTab === 'Convertir divisas' && (
                    <ConverterPanel />
                  )}
                  {activeTab === 'Invertir / Ahorro' && (
                    <InvestmentsPanel />
                  )}
                  {activeTab === 'Historial' && (
                    <DashboardPanel viewMode="history" />
                  )}
                </main>
                <RightPanel />
              </div>
            </ProtectedRoute>
          }
        />

        {/* Fallback Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
