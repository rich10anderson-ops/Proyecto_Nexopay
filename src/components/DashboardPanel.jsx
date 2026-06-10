import React, { useMemo, useState } from 'react'
import { useCurrency } from '../providers/CurrencyProvider'
import { useAlert } from '../providers/AlertProvider'
import { useAuth } from '../providers/AuthProvider'
import { uploadWithPresignedUrl } from '../services/api'

export default function DashboardPanel({ viewMode = 'all' }) {
  const { balances, currencies, transactions, simulateDeposit } = useCurrency()
  const { addAlert } = useAlert()
  const { user } = useAuth()
  const [depAmount, setDepAmount] = useState('')
  const [depSymbol, setDepSymbol] = useState('USD')
  const [documentStatus, setDocumentStatus] = useState('Pendiente')
  const [isUploading, setIsUploading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 5

  const totalLogs = transactions.length
  const totalPages = Math.max(1, Math.ceil(totalLogs / pageSize))
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return transactions.slice(start, start + pageSize)
  }, [transactions, currentPage])

  const assetDetails = useMemo(() => {
    let total = 0
    const list = Object.entries(balances).map(([symbol, balance]) => {
      const curr = currencies.find((c) => c.symbol.toUpperCase() === symbol)
      const valueUSD = balance * (curr ? curr.current_price : 0)
      total += valueUSD
      return { symbol, balance, valueUSD }
    })

    return {
      list: list.filter((asset) => asset.valueUSD > 0).sort((a, b) => b.valueUSD - a.valueUSD),
      totalUSD: total,
    }
  }, [balances, currencies])

  const handleDepositSubmit = (event) => {
    event.preventDefault()
    const amount = Number(depAmount)
    if (!depAmount || amount <= 0) {
      addAlert('Ingresa un monto válido mayor a cero.', 'warning')
      return
    }

    const success = simulateDeposit(depSymbol, amount, addAlert)
    if (!success) return

    setDepAmount('')
    setCurrentPage(1)
  }

  const handleDocumentUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setDocumentStatus('Subiendo')
    try {
      const result = await uploadWithPresignedUrl(file)
      setDocumentStatus(result.isMock ? 'Guardado local' : 'Recibido')
      addAlert(result.isMock ? 'Documento listo en modo local.' : 'Documento subido a S3 correctamente.', 'success')
    } catch (error) {
      console.error(error)
      setDocumentStatus('Error')
      addAlert('No fue posible subir el documento.', 'error')
    } finally {
      setIsUploading(false)
      event.target.value = ''
    }
  }

  if (viewMode === 'history') {
    return (
      <div className="dashboard-card">
        <div className="dashboard-header">
          <div>
            <div className="section-kicker">Auditoría Transaccional</div>
            <h2 className="trade-title">Historial de Capital</h2>
            <p className="small">Sesión activa para {user?.email || user?.name}</p>
          </div>
          <div className="badge">Registros de Fondos</div>
        </div>
        <div className="dashboard-sub-panel" style={{ background: 'transparent', border: 'none', padding: 0 }}>
          <div className="log-table-container">
            <table className="log-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Moneda</th>
                  <th>Monto</th>
                  <th>Detalle / Tipo</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLogs.map((log) => {
                  const isPositive = log.amount > 0;
                  const absAmount = Math.abs(log.amount);
                  const formattedAmt = isPositive 
                    ? `+${absAmount.toLocaleString(undefined, { minimumFractionDigits: absAmount < 1 ? 4 : 2 })}` 
                    : `-${absAmount.toLocaleString(undefined, { minimumFractionDigits: absAmount < 1 ? 4 : 2 })}`;
                  const typeLabel = log.type === 'buy' ? 'Compra' : 
                                    log.type === 'sell' ? 'Venta' : 
                                    log.type === 'convert' ? 'Conversión' : 
                                    log.type === 'stake' ? 'Staking' : 'Depósito';
                  
                  return (
                    <tr key={log.id}>
                      <td>{log.date}</td>
                      <td>
                        <span className="symbol-tag" style={{ fontSize: '10.5px', padding: '2px 6px', display: 'inline-block' }}>
                          {log.symbol}
                        </span>
                      </td>
                      <td style={{ color: isPositive ? 'var(--accent-success)' : 'var(--accent-danger)', fontWeight: 'bold' }}>
                        {formattedAmt}
                      </td>
                      <td>
                        <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{typeLabel}</div>
                        <div className="small" style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>{log.desc}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', gap: '12px' }}>
            <div className="small">
              Mostrando {Math.min(totalLogs, (currentPage - 1) * pageSize + 1)} - {Math.min(totalLogs, currentPage * pageSize)} de {totalLogs}
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                className="btn btn-ghost"
                style={{ padding: '6px 12px', minHeight: '32px' }}
                onClick={() => setCurrentPage((val) => Math.max(1, val - 1))}
                disabled={currentPage <= 1}
              >
                Anterior
              </button>
              <span className="small" style={{ fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                {currentPage} / {totalPages}
              </span>
              <button
                className="btn btn-ghost"
                style={{ padding: '6px 12px', minHeight: '32px' }}
                onClick={() => setCurrentPage((val) => Math.min(totalPages, val + 1))}
                disabled={currentPage >= totalPages}
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-card">
      <div className="dashboard-header">
        <div>
          <div className="section-kicker">Dashboard autenticado</div>
          <h2 className="trade-title">Resumen de cuenta</h2>
          <p className="small">Sesion activa para {user?.email || user?.name}</p>
        </div>
        <div className="badge">Consola principal</div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-stat-card">
          <div className="stat-label">Valor estimado</div>
          <div className="stat-value">
            ${assetDetails.totalUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="small">USD equivalente</div>
        </div>
        <div className="dashboard-stat-card">
          <div className="stat-label">Ingresos recientes</div>
          <div className="stat-value">{transactions.length}</div>
          <div className="small">Operaciones registradas</div>
        </div>
        <div className="dashboard-stat-card">
          <div className="stat-label">Verificacion</div>
          <div className="stat-value status-value">{documentStatus}</div>
          <div className="small">Identidad y origen de fondos</div>
        </div>
      </div>

      <div className="dashboard-content-split" style={{ marginBottom: 20 }}>
        <div className="dashboard-sub-panel">
          <div className="dashboard-section-title">Distribucion de activos</div>
          <div className="asset-bars">
            {assetDetails.list.map((asset) => {
              const percentage = assetDetails.totalUSD > 0 ? (asset.valueUSD / assetDetails.totalUSD) * 100 : 0
              return (
                <div key={asset.symbol}>
                  <div className="asset-row">
                    <span>{asset.symbol} ({asset.balance.toFixed(asset.balance < 1 ? 4 : 2)})</span>
                    <span>${asset.valueUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="dashboard-sub-panel">
          <div className="dashboard-section-title">Ingresar fondos</div>
          <form className="deposit-form" onSubmit={handleDepositSubmit}>
            <div className="form-group">
              <label>Divisa / cripto</label>
              <select className="form-select" value={depSymbol} onChange={(e) => setDepSymbol(e.target.value)}>
                {currencies.map((c) => (
                  <option key={c.id} value={c.symbol.toUpperCase()}>
                    {c.symbol.toUpperCase()} - {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Monto</label>
              <input
                type="number"
                placeholder="0.00"
                value={depAmount}
                onChange={(e) => setDepAmount(e.target.value)}
                className="neon-input"
                min="0"
                step="any"
              />
            </div>
            <button type="submit" className="btn btn-primary wide">Registrar ingreso</button>
          </form>
        </div>
      </div>

      <div className="dashboard-content-split">
        <div className="dashboard-sub-panel">
          <div className="dashboard-section-title">Historial de capital</div>
          <div className="log-table-container">
            <table className="log-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Moneda</th>
                  <th>Monto</th>
                  <th>Detalle / Tipo</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLogs.map((log) => {
                  const isPositive = log.amount > 0;
                  const absAmount = Math.abs(log.amount);
                  const formattedAmt = isPositive 
                    ? `+${absAmount.toLocaleString(undefined, { minimumFractionDigits: absAmount < 1 ? 4 : 2 })}` 
                    : `-${absAmount.toLocaleString(undefined, { minimumFractionDigits: absAmount < 1 ? 4 : 2 })}`;
                  const typeLabel = log.type === 'buy' ? 'Compra' : 
                                    log.type === 'sell' ? 'Venta' : 
                                    log.type === 'convert' ? 'Conversión' : 
                                    log.type === 'stake' ? 'Staking' : 'Depósito';
                  
                  return (
                    <tr key={log.id}>
                      <td>{log.date}</td>
                      <td>
                        <span className="symbol-tag" style={{ fontSize: '10.5px', padding: '2px 6px', display: 'inline-block' }}>
                          {log.symbol}
                        </span>
                      </td>
                      <td style={{ color: isPositive ? 'var(--accent-success)' : 'var(--accent-danger)', fontWeight: 'bold' }}>
                        {formattedAmt}
                      </td>
                      <td>
                        <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{typeLabel}</div>
                        <div className="small" style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>{log.desc}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', gap: '12px' }}>
            <div className="small">
              Mostrando {Math.min(totalLogs, (currentPage - 1) * pageSize + 1)} - {Math.min(totalLogs, currentPage * pageSize)} de {totalLogs}
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                className="btn btn-ghost"
                style={{ padding: '6px 12px', minHeight: '32px' }}
                onClick={() => setCurrentPage((val) => Math.max(1, val - 1))}
                disabled={currentPage <= 1}
              >
                Anterior
              </button>
              <span className="small" style={{ fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                {currentPage} / {totalPages}
              </span>
              <button
                className="btn btn-ghost"
                style={{ padding: '6px 12px', minHeight: '32px' }}
                onClick={() => setCurrentPage((val) => Math.min(totalPages, val + 1))}
                disabled={currentPage >= totalPages}
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>

        <div className="dashboard-sub-panel">
          <div className="dashboard-section-title">Documento de verificacion</div>
          <p className="small">
            Sube una imagen o PDF. El front solicita `/api/get-presigned-url` y luego carga el archivo con PUT a la URL firmada.
          </p>
          <label className="upload-box">
            <input type="file" accept="image/*,application/pdf" onChange={handleDocumentUpload} disabled={isUploading} />
            <span>{isUploading ? 'Subiendo...' : 'Seleccionar documento'}</span>
          </label>
        </div>
      </div>
    </div>
  )
}
