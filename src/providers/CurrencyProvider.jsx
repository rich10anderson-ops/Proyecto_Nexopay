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
  const { user } = useAuth()
  const userId = user ? user.id : 'demo-user'

  const [currencies, setCurrencies] = useState(FALLBACK_CURRENCIES)
  const [balances, setBalances] = useState(DEFAULT_BALANCES)
  const [transactions, setTransactions] = useState(DEFAULT_TRANSACTIONS)
  const [investments, setInvestments] = useState(DEFAULT_INVESTMENTS)

  // Sincronizar estados con localStorage cuando cambia el usuario
  useEffect(() => {
    const storedBalances = localStorage.getItem(`nexopay:balances:${userId}`)
    const storedTransactions = localStorage.getItem(`nexopay:transactions:${userId}`)
    const storedInvestments = localStorage.getItem(`nexopay:investments:${userId}`)

    if (storedBalances) {
      setBalances(JSON.parse(storedBalances))
    } else {
      setBalances(DEFAULT_BALANCES)
      localStorage.setItem(`nexopay:balances:${userId}`, JSON.stringify(DEFAULT_BALANCES))
    }

    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions))
    } else {
      setTransactions(DEFAULT_TRANSACTIONS)
      localStorage.setItem(`nexopay:transactions:${userId}`, JSON.stringify(DEFAULT_TRANSACTIONS))
    }

    if (storedInvestments) {
      setInvestments(JSON.parse(storedInvestments))
    } else {
      setInvestments(DEFAULT_INVESTMENTS)
      localStorage.setItem(`nexopay:investments:${userId}`, JSON.stringify(DEFAULT_INVESTMENTS))
    }
  }, [userId])

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
      toastCallback?.('Por favor, ingresa un monto válido.', 'warning')
      return false
    }

    const key = symbol.toUpperCase()
    const targetCurr = currencies.find((currency) => currency.symbol.toLowerCase() === symbol.toLowerCase())
    if (!targetCurr) {
      toastCallback?.('Moneda no disponible.', 'error')
      return false
    }

    if (key === 'USD') {
      toastCallback?.('No puedes comprar dólar con dólar.', 'warning')
      return false
    }

    const costInUSD = amount * targetCurr.current_price
    if (balances.USD < costInUSD) {
      toastCallback?.(`Fondos insuficientes. Requieres $${costInUSD.toFixed(2)} USD.`, 'error')
      return false
    }

    setBalances((current) => {
      const next = {
        ...current,
        USD: Math.max(0, current.USD - costInUSD),
        [key]: (current[key] || 0) + Number(amount),
      }
      localStorage.setItem(`nexopay:balances:${userId}`, JSON.stringify(next))
      return next
    })

    setTransactions((current) => {
      const next = [
        {
          id: Date.now(),
          date: new Date().toLocaleString('es-CO', { hour12: false }).replace(',', ''),
          symbol: key,
          amount: Number(amount),
          type: 'buy',
          desc: `Comprado con $${costInUSD.toFixed(2)} USD`
        },
        ...current
      ]
      localStorage.setItem(`nexopay:transactions:${userId}`, JSON.stringify(next))
      return next
    })

    toastCallback?.(`Compra exitosa: ${amount} ${key} por $${costInUSD.toFixed(2)} USD.`, 'success')
    return true
  }

  function simulateSell(symbol, amount, toastCallback) {
    if (!amount || amount <= 0) {
      toastCallback?.('Por favor, ingresa un monto válido.', 'warning')
      return false
    }

    const key = symbol.toUpperCase()
    const targetCurr = currencies.find((currency) => currency.symbol.toLowerCase() === symbol.toLowerCase())
    if (!targetCurr) {
      toastCallback?.('Moneda no disponible.', 'error')
      return false
    }

    if (key === 'USD') {
      toastCallback?.('No puedes vender dólar por dólar.', 'warning')
      return false
    }

    if ((balances[key] || 0) < amount) {
      toastCallback?.(`Saldo insuficiente de ${key}.`, 'error')
      return false
    }

    const earningsInUSD = amount * targetCurr.current_price
    
    setBalances((current) => {
      const next = {
        ...current,
        [key]: Math.max(0, current[key] - Number(amount)),
        USD: current.USD + earningsInUSD,
      }
      localStorage.setItem(`nexopay:balances:${userId}`, JSON.stringify(next))
      return next
    })

    setTransactions((current) => {
      const next = [
        {
          id: Date.now(),
          date: new Date().toLocaleString('es-CO', { hour12: false }).replace(',', ''),
          symbol: key,
          amount: -Number(amount),
          type: 'sell',
          desc: `Vendido por $${earningsInUSD.toFixed(2)} USD`
        },
        ...current
      ]
      localStorage.setItem(`nexopay:transactions:${userId}`, JSON.stringify(next))
      return next
    })

    toastCallback?.(`Venta exitosa: ${amount} ${key} por $${earningsInUSD.toFixed(2)} USD.`, 'success')
    return true
  }

  function simulateDeposit(symbol, amount, toastCallback) {
    if (!amount || amount <= 0) {
      toastCallback?.('Por favor, ingresa un monto válido.', 'warning')
      return false
    }

    const key = symbol.toUpperCase()
    
    setBalances((current) => {
      const next = {
        ...current,
        [key]: (current[key] || 0) + Number(amount),
      }
      localStorage.setItem(`nexopay:balances:${userId}`, JSON.stringify(next))
      return next
    })

    setTransactions((current) => {
      const next = [
        {
          id: Date.now(),
          date: new Date().toLocaleString('es-CO', { hour12: false }).replace(',', ''),
          symbol: key,
          amount: Number(amount),
          type: 'deposit',
          desc: `Ingreso de fondos`
        },
        ...current
      ]
      localStorage.setItem(`nexopay:transactions:${userId}`, JSON.stringify(next))
      return next
    })

    toastCallback?.(`Depósito exitoso: ${amount} ${key}.`, 'success')
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

    setBalances((current) => {
      const next = {
        ...current,
        [fromKey]: Math.max(0, current[fromKey] - Number(amount)),
        [toKey]: (current[toKey] || 0) + targetAmount,
      }
      localStorage.setItem(`nexopay:balances:${userId}`, JSON.stringify(next))
      return next
    })

    setTransactions((current) => {
      const next = [
        {
          id: Date.now(),
          date: new Date().toLocaleString('es-CO', { hour12: false }).replace(',', ''),
          symbol: fromKey,
          amount: -Number(amount),
          type: 'convert',
          desc: `Convertido a ${targetAmount.toFixed(targetAmount < 1 ? 4 : 2)} ${toKey}`
        },
        ...current
      ]
      localStorage.setItem(`nexopay:transactions:${userId}`, JSON.stringify(next))
      return next
    })

    toastCallback?.(`Conversión exitosa: ${amount} ${fromKey} convertidos a ${targetAmount.toFixed(targetAmount < 1 ? 4 : 2)} ${toKey}.`, 'success')
    return true
  }

  function simulateStaking(symbol, amount, pkgName, apy, toastCallback) {
    if (!amount || amount <= 0) {
      toastCallback?.('Por favor, ingresa un monto válido.', 'warning')
      return false
    }

    const key = symbol.toUpperCase()
    if ((balances[key] || 0) < amount) {
      toastCallback?.(`Saldo insuficiente de ${key}.`, 'error')
      return false
    }

    setBalances((current) => {
      const next = {
        ...current,
        [key]: Math.max(0, current[key] - Number(amount)),
      }
      localStorage.setItem(`nexopay:balances:${userId}`, JSON.stringify(next))
      return next
    })

    setInvestments((current) => {
      const next = [
        {
          id: Date.now(),
          name: pkgName,
          symbol: key,
          amount: Number(amount),
          apy,
          date: new Date().toLocaleDateString('es-CO')
        },
        ...current
      ]
      localStorage.setItem(`nexopay:investments:${userId}`, JSON.stringify(next))
      return next
    })

    setTransactions((current) => {
      const next = [
        {
          id: Date.now(),
          date: new Date().toLocaleString('es-CO', { hour12: false }).replace(',', ''),
          symbol: key,
          amount: -Number(amount),
          type: 'stake',
          desc: `Inversión en ${pkgName}`
        },
        ...current
      ]
      localStorage.setItem(`nexopay:transactions:${userId}`, JSON.stringify(next))
      return next
    })

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
        localStorage.setItem(`nexopay:balances:${userId}`, JSON.stringify(copy))
        return copy
      })
    }, 60000)
    return () => clearInterval(id)
  }, [userId])

  return (
    <CurrencyContext.Provider value={{ currencies, balances, transactions, investments, simulateBuy, simulateSell, simulateDeposit, simulateConvert, simulateStaking }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  return useContext(CurrencyContext)
}
