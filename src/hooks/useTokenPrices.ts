/**
 * useTokenPrices Hook
 *
 * Fetches real token prices from the subgraph.
 * Uses derivedETH * ethPriceUSD for USD conversion.
 */

import { useQuery } from '@tanstack/react-query'
import { useChainId } from 'wagmi'
import { fetchAllTokenPrices } from '@/services/subgraph'
import { hasSubgraphSupport } from '@/config/subgraph'

export function useTokenPrices() {
  const chainId = useChainId()
  const hasSubgraph = hasSubgraphSupport(chainId)

  const {
    data: priceMap,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['tokenPrices', chainId],
    queryFn: () => fetchAllTokenPrices(chainId),
    enabled: hasSubgraph,
    staleTime: 30_000, // 30 seconds
    refetchInterval: 60_000, // Refetch every minute
  })

  /**
   * Get price for a token by address or symbol
   */
  const getPrice = (addressOrSymbol: string): number | null => {
    if (!priceMap) return null
    const key = addressOrSymbol.toLowerCase()
    return priceMap.get(key) ?? null
  }

  /**
   * Get native token price (ETH/W0G)
   */
  const getNativePrice = (): number | null => {
    if (!priceMap) return null
    return priceMap.get('native') ?? null
  }

  return {
    priceMap: priceMap ?? new Map<string, number>(),
    getPrice,
    getNativePrice,
    isLoading,
    error,
    hasSubgraph,
  }
}

export default useTokenPrices
