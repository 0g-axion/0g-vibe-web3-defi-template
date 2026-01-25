/**
 * useSubgraphPools Hook
 *
 * Fetches pool data from the configured DEX subgraph.
 * Provides real TVL, volume, fees, and price data for all pools.
 *
 * Config-driven: Uses chain-specific subgraph URL from config.
 */

import { useQuery } from '@tanstack/react-query'
import { useChainId } from 'wagmi'
import { fetchTopPools, fetchFactoryStats, type SubgraphPool } from '@/services/subgraph'
import { hasSubgraphSupport } from '@/config/subgraph'

export interface PoolData {
  id: string
  address: string
  token0: {
    address: string
    symbol: string
    name: string
    decimals: number
  }
  token1: {
    address: string
    symbol: string
    name: string
    decimals: number
  }
  feeTier: number
  feePercent: number
  liquidity: string
  tvl: number
  volume24h: number
  fees24h: number
  txCount: number
  // Derived stats
  apr: number // Estimated from fees/tvl
}

export interface ProtocolStats {
  totalPools: number
  totalTVL: number
  totalVolume: number
  totalTxCount: number
}

/**
 * Convert subgraph pool to our PoolData format
 */
function convertPool(pool: SubgraphPool): PoolData {
  const tvl = parseFloat(pool.totalValueLockedUSD) || 0
  const volume = parseFloat(pool.volumeUSD) || 0
  const fees = parseFloat(pool.feesUSD) || 0
  const feeTier = parseInt(pool.feeTier)

  // Estimate APR: (fees / tvl) * 365 * 100
  // This is a rough estimate based on total fees earned
  const apr = tvl > 0 ? (fees / tvl) * 365 * 100 : 0

  return {
    id: pool.id,
    address: pool.id,
    token0: {
      address: pool.token0.id,
      symbol: pool.token0.symbol,
      name: pool.token0.name,
      decimals: parseInt(pool.token0.decimals),
    },
    token1: {
      address: pool.token1.id,
      symbol: pool.token1.symbol,
      name: pool.token1.name,
      decimals: parseInt(pool.token1.decimals),
    },
    feeTier,
    feePercent: feeTier / 10000,
    liquidity: pool.liquidity,
    tvl,
    volume24h: volume, // Note: This is total volume, not 24h
    fees24h: fees, // Note: This is total fees, not 24h
    txCount: parseInt(pool.txCount),
    apr: Math.min(apr, 1000), // Cap at 1000% to avoid crazy numbers
  }
}

/**
 * useSubgraphPools Hook
 *
 * Fetches all pools from the subgraph with real data.
 */
export function useSubgraphPools(limit = 20) {
  const chainId = useChainId()
  const hasSubgraph = hasSubgraphSupport(chainId)

  const poolsQuery = useQuery({
    queryKey: ['subgraphPools', chainId, limit],
    queryFn: async () => {
      const pools = await fetchTopPools(chainId, limit)
      return pools.map(convertPool)
    },
    enabled: hasSubgraph,
    staleTime: 60000, // 1 minute
    refetchInterval: 60000, // Refetch every minute
  })

  const statsQuery = useQuery({
    queryKey: ['factoryStats', chainId],
    queryFn: () => fetchFactoryStats(chainId),
    enabled: hasSubgraph,
    staleTime: 60000,
    refetchInterval: 60000,
  })

  const protocolStats: ProtocolStats | null = statsQuery.data
    ? {
        totalPools: parseInt(statsQuery.data.poolCount),
        totalTVL: parseFloat(statsQuery.data.totalValueLockedUSD),
        totalVolume: parseFloat(statsQuery.data.totalVolumeUSD),
        totalTxCount: parseInt(statsQuery.data.txCount),
      }
    : null

  return {
    pools: poolsQuery.data || [],
    stats: protocolStats,
    isLoading: poolsQuery.isLoading || statsQuery.isLoading,
    error: (poolsQuery.error || statsQuery.error) as Error | null,
    refetch: () => {
      poolsQuery.refetch()
      statsQuery.refetch()
    },
    hasSubgraph,
    hasData: hasSubgraph && (poolsQuery.data?.length || 0) > 0,
  }
}

export default useSubgraphPools
