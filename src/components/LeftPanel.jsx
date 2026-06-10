import React, { useState } from 'react'
import { useCurrency } from '../providers/CurrencyProvider'
import { useAlert } from '../providers/AlertProvider'
import { useAuth } from '../providers/AuthProvider'

const MENU_ITEMS = [
  'Dashboard',
  'Administrar dinero',
  'Convertir divisas',
  'Invertir / Ahorro',
  'Historial',
]

export default function LeftPanel({ activeTab, setActiveTab }) {
  const { balances } = useCurrency()
  const { user } = useAuth()
  const { addAlert } = useAlert()
  const [pinned, setPinned] = useState(false)
  const [collapsed, setCollapsed] = useState(true)

  const handleMenuClick = (item) => {
    if (setActiveTab) {
      setActiveTab(item)
    } else {
      addAlert(`${item} listo para conectar con backend.`, 'info')
    }
  }

  return (
    <aside
      className={`left-panel-neon ${collapsed ? 'collapsed' : 'expanded'}`}
      onMouseEnter={() => {
        if (!pinned) setCollapsed(false)
      }}
      onMouseLeave={() => {
        if (!pinned) setCollapsed(true)
      }}
    >
      <div className="profile">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, overflow: 'hidden' }}>
          {user?.picture ? <img className="avatar image-avatar" src={user.picture} alt="" /> : <div className="avatar">N</div>}
          {!collapsed && (
            <div style={{ minWidth: '120px' }}>
              <div style={{ fontWeight: 800, fontSize: '14px' }}>{user?.name || 'Cuenta NEXOPAY'}</div>
              <div className="small" style={{ fontSize: '11px' }}>{user?.email || 'Multi-monedas'}</div>
            </div>
          )}
        </div>
        <button
          className={`btn-pin ${pinned ? 'active' : ''}`}
          onClick={(event) => {
            event.stopPropagation()
            setPinned((value) => !value)
          }}
          title={pinned ? 'Desanclar' : 'Anclar'}
        >
          {pinned ? '×' : '•'}
        </button>
      </div>

      {!collapsed && (
        <>
          <div className="menu-list">
            {MENU_ITEMS.map((item) => (
              <button
                key={item}
                className={`menu-item-neon ${item === activeTab ? 'active' : ''}`}
                onClick={() => handleMenuClick(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="balances-section">
            <div className="balances-title">Billetera activa</div>
            <div className="balances-grid">
              {Object.entries(balances).map(([key, value]) => {
                if (value <= 0 && key !== 'USD') return null
                return (
                  <div key={key} className="balance-row">
                    <span className="balance-symbol">{key}</span>
                    <span className="balance-value">
                      {key === 'BTC' || key === 'ETH' || key === 'SOL'
                        ? value.toFixed(4)
                        : value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </aside>
  )
}
