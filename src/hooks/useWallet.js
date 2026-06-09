import { useCurrency } from '../providers/CurrencyProvider'
export function useWallet(){
  const { balances, simulateBuy, simulateSell } = useCurrency()
  return { balances, simulateBuy, simulateSell }
}
