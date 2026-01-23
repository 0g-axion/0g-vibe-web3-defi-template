import { useState, useEffect, useCallback } from 'react'
import { parseAmount } from '@/lib/utils'
import { IS_DEMO_MODE, type Token } from '@/constants/tokens'

export interface SwapQuote {
  /** Amount to receive */
  amountOut: string
  /** Amount out in raw units */
  amountOutRaw: bigint
  /** Exchange rate */
  rate: number
  /** Price impact percentage */
  priceImpact: number
  /** Minimum amount out after slippage */
  minimumAmountOut: string
  /** LP fee percentage */
  lpFee: number
  /** Route path (token symbols) */
  route: string[]
}

export interface UseSwapQuoteOptions {
  /** Token to swap from */
  fromToken: Token
  /** Token to swap to */
  toToken: Token
  /** Amount to swap (formatted) */
  amount: string
  /** Slippage tolerance percentage */
  slippage: number
}

export interface UseSwapQuoteResult {
  /** Quote data */
  quote: SwapQuote | null
  /** Loading state */
  isLoading: boolean
  /** Error message */
  error: string | null
  /** Refetch quote */
  refetch: () => void
}

// Mock exchange rates for demo mode
const MOCK_RATES: Record<string, Record<string, number>> = {
  '0G': {
    USDCe: 1.5,
    wETH: 0.0005,
    st0G: 1.05,
    PAI: 2.0,
  },
  USDCe: {
    '0G': 0.667,
    wETH: 0.00033,
    st0G: 0.7,
    PAI: 1.33,
  },
  wETH: {
    '0G': 2000,
    USDCe: 3000,
    st0G: 2100,
    PAI: 4000,
  },
  st0G: {
    '0G': 0.95,
    USDCe: 1.43,
    wETH: 0.00048,
    PAI: 1.9,
  },
  PAI: {
    '0G': 0.5,
    USDCe: 0.75,
    wETH: 0.00025,
    st0G: 0.53,
  },
}

/**
 * useSwapQuote Hook
 *
 * Fetches a swap quote for the given token pair and amount.
 * In demo mode, returns mock data.
 *
 * @example
 * const { quote, isLoading } = useSwapQuote({
 *   fromToken,
 *   toToken,
 *   amount: '100',
 *   slippage: 0.5
 * })
 */
export function useSwapQuote({
  fromToken,
  toToken,
  amount,
  slippage,
}: UseSwapQuoteOptions): UseSwapQuoteResult {
  const [quote, setQuote] = useState<SwapQuote | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchQuote = useCallback(async () => {
    // Validate inputs
    if (!amount || parseFloat(amount) <= 0) {
      setQuote(null)
      return
    }

    if (fromToken.symbol === toToken.symbol) {
      setError('Cannot swap same token')
      setQuote(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      if (IS_DEMO_MODE) {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 300))

        // Get mock rate
        const rate =
          MOCK_RATES[fromToken.symbol]?.[toToken.symbol] ?? 1

        const amountNum = parseFloat(amount)
        const amountOut = amountNum * rate
        const priceImpact = Math.random() * 0.5 // 0-0.5% mock impact
        const lpFee = 0.3 // 0.3% LP fee

        const amountOutRaw = parseAmount(
          amountOut.toFixed(toToken.decimals),
          toToken.decimals
        )

        const minimumOut = amountOut * (1 - slippage / 100)

        setQuote({
          amountOut: amountOut.toFixed(6),
          amountOutRaw,
          rate,
          priceImpact,
          minimumAmountOut: minimumOut.toFixed(6),
          lpFee,
          route: [fromToken.symbol, toToken.symbol],
        })
      } else {
        // Real implementation would call DEX router here
        // For now, throw error indicating real contracts needed
        throw new Error('Real DEX contracts not configured')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch quote')
      setQuote(null)
    } finally {
      setIsLoading(false)
    }
  }, [fromToken, toToken, amount, slippage])

  useEffect(() => {
    const timeoutId = setTimeout(fetchQuote, 300) // Debounce
    return () => clearTimeout(timeoutId)
  }, [fetchQuote])

  return {
    quote,
    isLoading,
    error,
    refetch: fetchQuote,
  }
}

export default useSwapQuote
