import React, { useState, useMemo } from 'react'
import { useCurrency } from '../providers/CurrencyProvider'
import { useAlert } from '../providers/AlertProvider'

export default function ConverterPanel() {
  const { currencies, balances, simulateConvert } = useCurrency()
  const { addAlert } = useAlert()
  const [fromSymbol, setFromSymbol] = useState('USD')
  const [toSymbol, setToSymbol] = useState('BTC')
  const [amount, setAmount] = useState('')

  const activeCurrencies = useMemo(() => {
    return currencies.map(c => c.symbol.toUpperCase())
  }, [currencies])

  const conversionPreview = useMemo(() => {
    const num = Number(amount)
    if (!amount || num <= 0) return null

    const fromCurr = currencies.find((c) => c.symbol.toUpperCase() === fromSymbol)
    const toCurr = currencies.find((c) => c.symbol.toUpperCase() === toSymbol)

    if (!fromCurr || !toCurr) return null

    const valueUSD = num * fromCurr.current_price
    const result = valueUSD / toCurr.current_price

    return {
      result,
      fromPrice: fromCurr.current_price,
      toPrice: toCurr.current_price,
    }
  }, [amount, fromSymbol, toSymbol, currencies])

  const handleConvert = (e) => {
    e.preventDefault()
    const num = Number(amount)
    if (!amount || num <= 0) {
      addAlert('Ingresa un monto válido para convertir.', 'warning')
      return
    }

    const success = simulateConvert(fromSymbol, toSymbol, num, addAlert)
    if (success) {
      setAmount('')
    }
  }

  const currentBalance = balances[fromSymbol] || 0

  return (
    <div className="dashboard-card">
      <div className="dashboard-header">
        <div>
          <div className="section-kicker">Herramienta de Cambio</div>
          <h2 className="trade-title">Convertir Divisas y Cripto</h2>
          <p className="small">Cambia tus saldos al instante utilizando tasas preferenciales en tiempo real.</p>
        </div>
        <div className="badge">Tasa Cero Comisiones</div>
      </div>

      <form onSubmit={handleConvert} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label>Moneda de Origen</label>
            <select
              className="form-select"
              value={fromSymbol}
              onChange={(e) => setFromSymbol(e.target.value)}
            >
              {activeCurrencies.map((symbol) => (
                <option key={symbol} value={symbol}>
                  {symbol} - Saldo: {balances[symbol]?.toFixed(balances[symbol] < 1 ? 4 : 2) || '0.00'}
                </option>
              ))}
            </select>
            <div className="small" style={{ marginTop: '4px' }}>
              Disponible: {currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })} {fromSymbol}
            </div>
          </div>

          <div className="form-group">
            <label>Moneda de Destino</label>
            <select
              className="form-select"
              value={toSymbol}
              onChange={(e) => setToSymbol(e.target.value)}
            >
              {activeCurrencies.map((symbol) => (
                <option key={symbol} value={symbol}>
                  {symbol} - Saldo: {balances[symbol]?.toFixed(balances[symbol] < 1 ? 4 : 2) || '0.00'}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Monto a Convertir</label>
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
        </div>

        {conversionPreview && (
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--panel-border)',
              borderRadius: '8px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Monto estimado a recibir:</span>
              <strong style={{ color: 'var(--accent-success)' }}>
                {conversionPreview.result.toLocaleString(undefined, { minimumFractionDigits: conversionPreview.result < 1 ? 6 : 2 })} {toSymbol}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
              <span>Tasa de referencia:</span>
              <span>1 {fromSymbol} = {(conversionPreview.fromPrice / conversionPreview.toPrice).toFixed(6)} {toSymbol}</span>
            </div>
          </div>
        )}

        <button type="submit" className="btn btn-primary wide">
          Confirmar Conversión
        </button>
      </form>
    </div>
  )
}
