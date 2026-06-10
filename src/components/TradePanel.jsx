import React, { useMemo, useState } from 'react'
import CurrencyCard from './CurrencyCard'
import { useCurrency } from '../providers/CurrencyProvider'

export default function TradePanel(){
  const { currencies } = useCurrency()
  const [page, setPage] = useState(1)
  const pageSize = 6
  const total = currencies.length
  const pages = Math.max(1, Math.ceil(total / pageSize))

  const visible = useMemo(() => {
    const start = (page - 1) * pageSize
    return currencies.slice(start, start + pageSize)
  }, [currencies, page])

  return (
    <div className="trade-card">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap: 12}}>
        <h2 className="neon-text">Compra / Venta · NEXOPAY</h2>
        <div className="small">Simula operaciones</div>
      </div>

      {/* Panel Informativo de Opciones de Compra */}
      <div style={{
        background: 'rgba(243, 186, 47, 0.02)',
        border: '1px solid rgba(243, 186, 47, 0.15)',
        borderRadius: '10px',
        padding: '14px 18px',
        marginTop: '14px',
        marginBottom: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)', fontWeight: 'bold', fontSize: '13px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          Opciones y Reglas de Operación de Compra
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '11.5px', color: '#c0c8db', lineHeight: '1.5' }}>
          <div>
            <span style={{ fontWeight: 'bold', color: '#fff' }}>1. Compra Instantánea (USD):</span> Utiliza tus fondos disponibles en USD para comprar cualquier divisa o cripto. La conversión se calcula a tasa preferencial.
          </div>
          <div>
            <span style={{ fontWeight: 'bold', color: '#fff' }}>2. Liquidación Inmediata:</span> Al comprar, los activos se debitan de tu balance USD y se acreditan al instante en tu billetera del menú izquierdo.
          </div>
          <div>
            <span style={{ fontWeight: 'bold', color: '#fff' }}>3. Comisiones Cero:</span> En este entorno de demostración local, las operaciones no generan tarifas ni spreads ocultos de corretaje.
          </div>
          <div>
            <span style={{ fontWeight: 'bold', color: '#fff' }}>4. Fluctuación de Tasas:</span> Los precios se actualizan en vivo desde CoinGecko cada 4 segundos. La tasa se garantiza al presionar "Comprar".
          </div>
        </div>
      </div>

      <div className="currency-list">
        {visible.map((currency) => <CurrencyCard key={currency.id} currency={currency} />)}
      </div>

      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:12}}>
        <div className="small">Mostrando {visible.length} de {total}</div>
        <div style={{display:'flex', gap:8, alignItems: 'center'}}>
          <button className="btn btn-ghost" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page <= 1}>
            Prev
          </button>
          <div className="small">{page} / {pages}</div>
          <button className="btn btn-ghost" onClick={() => setPage((value) => Math.min(pages, value + 1))} disabled={page >= pages}>
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
