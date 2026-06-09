import React from 'react'
import Navbar from './components/Navbar'
import LeftPanel from './components/LeftPanel'
import RightPanel from './components/RightPanel'
import TradePanel from './components/TradePanel'
import DashboardPanel from './components/DashboardPanel'
import LoginPanel from './components/LoginPanel'
import { useAuth } from './providers/AuthProvider'

export default function App() {
  const { user } = useAuth()

  return (
    <div className="app-root soft-finance-bg">
      <Navbar />
      {!user ? (
        <LoginPanel />
      ) : (
        <div className="layout">
          <LeftPanel />
          <main className="main-area dashboard-stack">
            <DashboardPanel />
            <TradePanel />
          </main>
          <RightPanel />
        </div>
      )}
    </div>
  )
}
