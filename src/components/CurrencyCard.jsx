import React, { useState } from 'react'
import { useCurrency } from '../providers/CurrencyProvider'
import { useAlert } from '../providers/AlertProvider'

export default function CurrencyCard({ currency }) {
  const { simulateBuy, simulateSell } = useCurrency()
  const { addAlert } = useAlert()
  const [amount, setAmount] = useState('')

  const handleBuy = () => {
    const num = Number(amount)
    if (!amount || num <= 0) {
      addAlert('Ingresa un monto mayor a cero para comprar.', 'warning')
      return
    }
    const success = simulateBuy(currency.symbol, num, addAlert)
    if (success) setAmount('')
  }

  const handleSell = () => {
    const num = Number(amount)
    if (!amount || num <= 0) {
      addAlert('Ingresa un monto mayor a cero para vender.', 'warning')
      return
    }
    const success = simulateSell(currency.symbol, num, addAlert)
    if (success) setAmount('')
  }

  // Formatting price display
  const priceDisplay = currency.current_price >= 1 
    ? currency.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : currency.current_price.toFixed(5)

  // 24h change percentage color
  const changeVal = currency.price_change_percentage_24h || 0
  const changeColor = changeVal >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)'

  return (
    <div className="currency-card-neon">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="symbol-tag">{currency.symbol.toUpperCase()}</div>
          <div className="small-name">{currency.name}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="neon-text-price">${priceDisplay}</div>
          <div style={{ fontSize: '11px', color: changeColor, fontWeight: 'bold' }}>
            {changeVal >= 0 ? '+' : ''}{changeVal.toFixed(2)}%
          </div>
        </div>
      </div>
      
      <div className="trade-inputs">
        <input
          type="number"
          placeholder="Monto"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="neon-input"
          min="0"
          step="any"
        />
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          <button className="btn btn-trade-buy" onClick={handleBuy}>
            Comprar
          </button>
          <button className="btn btn-trade-sell" onClick={handleSell}>
            Vender
          </button>
        </div>
      </div>
    </div>
  )
}
