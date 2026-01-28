/**
 * usePortfolio Hook
 *
 * Fetches user's token balances and calculates portfolio value.
 * Uses real token prices from the subgraph when available.
 */

import { useChainId, useAccount, useBalance, useReadContracts } from 'wagmi'
import { formatUnits } from 'viem'
import { getTokens, type Token } from '@/constants/tokens'
import { ERC20_ABI } from '@/constants/abis'
import { useTokenPrices } from './useTokenPrices'

export interface TokenHolding {
  token: Token
  balance: bigint
  formattedBalance: string
  usdValue: number
}

// Fallback prices when subgraph is unavailable
const FALLBACK_PRICES: Record<string, number> = {
  '0g': 0.5,
  'w0g': 0.5,
  'usdc': 1,
  'usdc.e': 1,
  'usdt': 1,
  'eth': 2500,
  'weth': 2500,
}

/**
 * usePortfolio Hook
 *
 * @returns User's token holdings with balances and USD values
 */
export function usePortfolio() {
  const chainId = useChainId()
  const { address, isConnected } = useAccount()

  // Get real token prices from subgraph
  const { getPrice, getNativePrice, isLoading: pricesLoading, hasSubgraph } = useTokenPrices()

  // Get all tokens for current chain
  const tokens = getTokens(chainId)

  // Fetch native token balance
  const {
    data: nativeBalance,
    isLoading: nativeLoading,
  } = useBalance({
    address,
    query: { enabled: isConnected && !!address },
  })

  // Prepare ERC20 balance calls
  const erc20Tokens = tokens.filter(t => !t.isNative && t.address !== 'native')

  const {
    data: erc20Balances,
    isLoading: erc20Loading,
  } = useReadContracts({
    contracts: erc20Tokens.map(token => ({
      address: token.address as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: address ? [address] : undefined,
    })),
    query: { enabled: isConnected && !!address && erc20Tokens.length > 0 },
  })

  /**
   * Get token price - tries subgraph first, then falls back to hardcoded
   */
  const getTokenPrice = (token: Token): number => {
    // Try to get real price from subgraph
    if (hasSubgraph) {
      if (token.isNative) {
        const nativePrice = getNativePrice()
        if (nativePrice !== null && nativePrice > 0) {
          return nativePrice
        }
      } else {
        const price = getPrice(token.address)
        if (price !== null && price > 0) {
          return price
        }
        // Also try by symbol
        const priceBySymbol = getPrice(token.symbol)
        if (priceBySymbol !== null && priceBySymbol > 0) {
          return priceBySymbol
        }
      }
    }

    // Fallback to hardcoded prices
    const symbolLower = token.symbol.toLowerCase()
    return FALLBACK_PRICES[symbolLower] ?? 0.1
  }

  // Build holdings array
  const holdings: TokenHolding[] = []

  // Add native token holding
  const nativeToken = tokens.find(t => t.isNative)
  if (nativeToken && nativeBalance) {
    const balance = nativeBalance.value
    const formattedBalance = formatUnits(balance, nativeToken.decimals)
    const price = getTokenPrice(nativeToken)
    holdings.push({
      token: nativeToken,
      balance,
      formattedBalance: parseFloat(formattedBalance).toFixed(4),
      usdValue: parseFloat(formattedBalance) * price,
    })
  }

  // Add ERC20 token holdings
  if (erc20Balances) {
    erc20Tokens.forEach((token, index) => {
      const result = erc20Balances[index]
      if (result.status === 'success' && result.result) {
        const balance = result.result as bigint
        if (balance > 0n) {
          const formattedBalance = formatUnits(balance, token.decimals)
          const price = getTokenPrice(token)
          holdings.push({
            token,
            balance,
            formattedBalance: parseFloat(formattedBalance).toFixed(4),
            usdValue: parseFloat(formattedBalance) * price,
          })
        }
      }
    })
  }

  // Sort by USD value descending
  holdings.sort((a, b) => b.usdValue - a.usdValue)

  // Calculate total portfolio value
  const totalValue = holdings.reduce((sum, h) => sum + h.usdValue, 0)

  return {
    holdings,
    totalValue,
    isLoading: nativeLoading || erc20Loading || pricesLoading,
    isConnected,
    hasHoldings: holdings.length > 0,
    hasRealPrices: hasSubgraph,
  }
}

export default usePortfolio
