import React, { useState, useMemo } from 'react'
import { useCurrency } from '../providers/CurrencyProvider'
import { useAlert } from '../providers/AlertProvider'

const PACKAGES = [
  { id: 'usd_flex', name: 'Ahorro Flexible USD', symbol: 'USD', apy: 5.2, risk: 'Bajo' },
  { id: 'eth_staking', name: 'Staking Ethereum', symbol: 'ETH', apy: 4.1, risk: 'Medio' },
  { id: 'btc_vault', name: 'Bóveda Segura Bitcoin', symbol: 'BTC', apy: 2.8, risk: 'Medio' },
  { id: 'sol_staking', name: 'Staking Solana', symbol: 'SOL', apy: 6.5, risk: 'Alto' }
]

export default function InvestmentsPanel() {
  const { balances, investments, simulateStaking } = useCurrency()
  const { addAlert } = useAlert()
  const [selectedPkgId, setSelectedPkgId] = useState('usd_flex')
  const [amount, setAmount] = useState('')

  const selectedPkg = useMemo(() => {
    return PACKAGES.find(p => p.id === selectedPkgId)
  }, [selectedPkgId])

  const handleInvest = (e) => {
    e.preventDefault()
    const num = Number(amount)
    if (!amount || num <= 0) {
      addAlert('Ingresa un monto válido para invertir.', 'warning')
      return
    }

    const success = simulateStaking(selectedPkg.symbol, num, selectedPkg.name, selectedPkg.apy, addAlert)
    if (success) {
      setAmount('')
    }
  }

  const currentBalance = balances[selectedPkg.symbol] || 0

  return (
    <div className="dashboard-card">
      <div className="dashboard-header">
        <div>
          <div className="section-kicker">Inversiones & Multiplicación</div>
          <h2 className="trade-title">Bóvedas de Rendimiento (Staking)</h2>
          <p className="small">Deposita tus activos inactivos para acumular rendimientos pasivos de forma segura.</p>
        </div>
        <div className="badge">APY hasta 6.5%</div>
      </div>

      <div className="dashboard-content-split">
        <div className="dashboard-sub-panel" style={{ background: 'rgba(255, 255, 255, 0.01)' }}>
          <div className="dashboard-section-title">Nueva Inversión</div>
          <form onSubmit={handleInvest} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group">
              <label>Plan de Rendimiento</label>
              <select
                className="form-select"
                value={selectedPkgId}
                onChange={(e) => setSelectedPkgId(e.target.value)}
              >
                {PACKAGES.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name} ({pkg.apy}% APY · Riesgo: {pkg.risk})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Monto a Invertir ({selectedPkg.symbol})</label>
              <input
                type="number"
                placeholder="0.00"
                className="neon-input"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="any"
                required
              />
              <div className="small" style={{ marginTop: '4px' }}>
                Saldo disponible: {currentBalance.toFixed(selectedPkg.symbol === 'USD' ? 2 : 4)} {selectedPkg.symbol}
              </div>
            </div>

            {amount && Number(amount) > 0 && (
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--panel-border)',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '12.5px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Retorno Anual Estimado:</span>
                  <strong style={{ color: 'var(--accent-success)' }}>
                    {(Number(amount) * (selectedPkg.apy / 100)).toFixed(selectedPkg.symbol === 'USD' ? 2 : 4)} {selectedPkg.symbol}
                  </strong>
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary wide">
              Transferir a la Bóveda
            </button>
          </form>
        </div>

        <div className="dashboard-sub-panel" style={{ background: 'rgba(255, 255, 255, 0.01)' }}>
          <div className="dashboard-section-title">Mis Bóvedas Activas</div>
          <div className="log-table-container">
            <table className="log-table" style={{ fontSize: '12px' }}>
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>Monto</th>
                  <th>APY</th>
                  <th>Rendimiento</th>
                </tr>
              </thead>
              <tbody>
                {investments.map((inv) => (
                  <tr key={inv.id}>
                    <td>
                      <div>{inv.name}</div>
                      <div className="small" style={{ fontSize: '10px' }}>Iniciado: {inv.date}</div>
                    </td>
                    <td>{inv.amount.toLocaleString()} {inv.symbol}</td>
                    <td>{inv.apy}%</td>
                    <td style={{ color: 'var(--accent-success)', fontWeight: 'bold' }}>
                      +{(inv.amount * (inv.apy / 100) / 12).toFixed(inv.symbol === 'USD' ? 2 : 4)} / mes
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
