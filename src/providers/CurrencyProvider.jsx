import React, { createContext, useContext, useEffect, useState } from 'react'
import { fetchTopCurrencies } from '../services/api'

const CurrencyContext = createContext()

const FALLBACK_CURRENCIES = [
  { id: 'usd', symbol: 'usd', name: 'Dolar estadounidense', current_price: 1.0, isCrypto: false },
  { id: 'eur', symbol: 'eur', name: 'Euro', current_price: 1.085, isCrypto: false },
  { id: 'gbp', symbol: 'gbp', name: 'Libra esterlina', current_price: 1.275, isCrypto: false },
  { id: 'ars', symbol: 'ars', name: 'Peso argentino', current_price: 0.0011, isCrypto: false },
  { id: 'cop', symbol: 'cop', name: 'Peso colombiano', current_price: 0.00025, isCrypto: false },
  { id: 'mxn', symbol: 'mxn', name: 'Peso mexicano', current_price: 0.057, isCrypto: false },
  { id: 'brl', symbol: 'brl', name: 'Real brasileno', current_price: 0.19, isCrypto: false },
  { id: 'jpy', symbol: 'jpy', name: 'Yen japones', current_price: 0.0064, isCrypto: false },
  { id: 'btc', symbol: 'btc', name: 'Bitcoin', current_price: 68500.0, isCrypto: true },
  { id: 'eth', symbol: 'eth', name: 'Ethereum', current_price: 3650.0, isCrypto: true },
  { id: 'sol', symbol: 'sol', name: 'Solana', current_price: 162.0, isCrypto: true },
]

export function CurrencyProvider({ children }) {
  const [currencies, setCurrencies] = useState(FALLBACK_CURRENCIES)
  const [balances, setBalances] = useState({
    USD: 2500.0,
    EUR: 500.0,
    GBP: 0.0,
    ARS: 150000.0,
    COP: 0.0,
    MXN: 0.0,
    BRL: 0.0,
    JPY: 0,
    BTC: 0.05,
    ETH: 0.8,
    SOL: 4.5,
  })

  useEffect(() => {
    let mounted = true
    fetchTopCurrencies().then((list) => {
      if (!mounted || !list?.length) return
      setCurrencies((prev) => prev.map((item) => {
        const externalMatch = list.find((currency) => currency.symbol.toLowerCase() === item.symbol.toLowerCase())
        if (!externalMatch) return item
        return {
          ...item,
          current_price: externalMatch.current_price,
          price_change_percentage_24h: externalMatch.price_change_percentage_24h,
        }
      }))
    })
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrencies((prev) => prev.map((currency) => {
        const volatility = currency.isCrypto ? 0.006 : 0.0008
        const changePercent = (Math.random() - 0.5) * 2 * volatility
        const newPrice = Math.max(0.00001, currency.current_price * (1 + changePercent))
        const prevChange = currency.price_change_percentage_24h || 0

        return {
          ...currency,
          current_price: Number(newPrice.toFixed(currency.isCrypto ? 2 : 5)),
          price_change_percentage_24h: Number((prevChange + changePercent * 100).toFixed(2)),
        }
      }))
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  function simulateBuy(symbol, amount, toastCallback) {
    if (!amount || amount <= 0) {
      toastCallback?.('Por favor, ingresa un monto valido.', 'warning')
      return false
    }

    const key = symbol.toUpperCase()
    const targetCurr = currencies.find((currency) => currency.symbol.toLowerCase() === symbol.toLowerCase())
    if (!targetCurr) {
      toastCallback?.('Moneda no disponible.', 'error')
      return false
    }

    if (key === 'USD') {
      toastCallback?.('No puedes comprar dolar con dolar.', 'warning')
      return false
    }

    const costInUSD = amount * targetCurr.current_price
    if (balances.USD < costInUSD) {
      toastCallback?.(`Fondos insuficientes. Requieres $${costInUSD.toFixed(2)} USD.`, 'error')
      return false
    }

    setBalances((current) => ({
      ...current,
      USD: Math.max(0, current.USD - costInUSD),
      [key]: (current[key] || 0) + Number(amount),
    }))

    toastCallback?.(`Compra exitosa: ${amount} ${key} por $${costInUSD.toFixed(2)} USD.`, 'success')
    return true
  }

  function simulateSell(symbol, amount, toastCallback) {
    if (!amount || amount <= 0) {
      toastCallback?.('Por favor, ingresa un monto valido.', 'warning')
      return false
    }

    const key = symbol.toUpperCase()
    const targetCurr = currencies.find((currency) => currency.symbol.toLowerCase() === symbol.toLowerCase())
    if (!targetCurr) {
      toastCallback?.('Moneda no disponible.', 'error')
      return false
    }

    if (key === 'USD') {
      toastCallback?.('No puedes vender dolar por dolar.', 'warning')
      return false
    }

    if ((balances[key] || 0) < amount) {
      toastCallback?.(`Saldo insuficiente de ${key}.`, 'error')
      return false
    }

    const earningsInUSD = amount * targetCurr.current_price
    setBalances((current) => ({
      ...current,
      [key]: Math.max(0, current[key] - Number(amount)),
      USD: current.USD + earningsInUSD,
    }))

    toastCallback?.(`Venta exitosa: ${amount} ${key} por $${earningsInUSD.toFixed(2)} USD.`, 'success')
    return true
  }

  function simulateDeposit(symbol, amount, toastCallback) {
    if (!amount || amount <= 0) {
      toastCallback?.('Por favor, ingresa un monto valido.', 'warning')
      return false
    }

    const key = symbol.toUpperCase()
    setBalances((current) => ({
      ...current,
      [key]: (current[key] || 0) + Number(amount),
    }))

    toastCallback?.(`Deposito exitoso: ${amount} ${key}.`, 'success')
    return true
  }

  function simulateConvert(fromSymbol, toSymbol, amount, toastCallback) {
    if (!amount || amount <= 0) {
      toastCallback?.('Por favor, ingresa un monto válido.', 'warning')
      return false
    }

    const fromKey = fromSymbol.toUpperCase()
    const toKey = toSymbol.toUpperCase()

    if (fromKey === toKey) {
      toastCallback?.('No puedes convertir una moneda a sí misma.', 'warning')
      return false
    }

    if ((balances[fromKey] || 0) < amount) {
      toastCallback?.(`Saldo insuficiente de ${fromKey}.`, 'error')
      return false
    }

    const fromCurr = currencies.find((c) => c.symbol.toUpperCase() === fromKey)
    const toCurr = currencies.find((c) => c.symbol.toUpperCase() === toKey)

    if (!fromCurr || !toCurr) {
      toastCallback?.('Monedas no disponibles para conversión.', 'error')
      return false
    }

    const valueUSD = amount * fromCurr.current_price
    const targetAmount = valueUSD / toCurr.current_price

    setBalances((current) => ({
      ...current,
      [fromKey]: Math.max(0, current[fromKey] - Number(amount)),
      [toKey]: (current[toKey] || 0) + targetAmount,
    }))

    toastCallback?.(`Conversión exitosa: ${amount} ${fromKey} convertidos a ${targetAmount.toFixed(targetAmount < 1 ? 4 : 2)} ${toKey}.`, 'success')
    return true
  }

  function simulateStaking(symbol, amount, toastCallback) {
    if (!amount || amount <= 0) {
      toastCallback?.('Por favor, ingresa un monto válido.', 'warning')
      return false
    }

    const key = symbol.toUpperCase()
    if ((balances[key] || 0) < amount) {
      toastCallback?.(`Saldo insuficiente de ${key}.`, 'error')
      return false
    }

    setBalances((current) => ({
      ...current,
      [key]: Math.max(0, current[key] - Number(amount)),
    }))

    toastCallback?.(`Inversión exitosa: ${amount} ${key} transferidos a tu Bóveda de Ahorro.`, 'success')
    return true
  }

  useEffect(() => {
    const id = setInterval(() => {
      setBalances((current) => {
        const copy = { ...current }
        Object.keys(copy).forEach((key) => {
          if (copy[key] > 0) copy[key] = copy[key] * 1.00005
        })
        return copy
      })
    }, 60000)
    return () => clearInterval(id)
  }, [])

  return (
    <CurrencyContext.Provider value={{ currencies, balances, simulateBuy, simulateSell, simulateDeposit, simulateConvert, simulateStaking }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  return useContext(CurrencyContext)
}
