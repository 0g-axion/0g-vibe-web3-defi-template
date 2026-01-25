/**
 * usePools Hook
 *
 * Fetches pool data from on-chain contracts.
 * Returns pool liquidity, prices, and user positions.
 */

import { useChainId, usePublicClient } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import { getPools, type Pool } from '@/constants/pools'
import { POOL_ABI } from '@/constants/abis'
import { hasDexSupport } from '@/config/chains'

export interface PoolState {
  sqrtPriceX96: bigint
  tick: number
  liquidity: bigint
  price: number // Derived price of token1 in terms of token0
}

export interface PoolWithState extends Pool {
  state?: PoolState
  tvl?: number // Total value locked (estimated)
  apr?: number // Annual percentage rate (mock for now)
  volume24h?: number // 24h volume (mock for now)
}

/**
 * Fetch pool state from contract
 */
async function fetchPoolState(
  publicClient: ReturnType<typeof usePublicClient>,
  poolAddress: `0x${string}`
): Promise<PoolState | null> {
  if (!publicClient) return null

  try {
    const [slot0Result, liquidityResult] = await Promise.all([
      publicClient.readContract({
        address: poolAddress,
        abi: POOL_ABI,
        functionName: 'slot0',
      }),
      publicClient.readContract({
        address: poolAddress,
        abi: POOL_ABI,
        functionName: 'liquidity',
      }),
    ])

    // slot0 returns: [sqrtPriceX96, tick, observationIndex, observationCardinality, observationCardinalityNext, feeProtocol, unlocked]
    const slot0 = slot0Result as unknown as readonly [bigint, number, number, number, number, number, boolean]
    const sqrtPriceX96 = slot0[0]
    const tick = slot0[1]
    const liquidity = liquidityResult as bigint

    // Calculate price from sqrtPriceX96
    // price = (sqrtPriceX96 / 2^96)^2
    const sqrtPrice = Number(sqrtPriceX96) / 2 ** 96
    const price = sqrtPrice * sqrtPrice

    return {
      sqrtPriceX96,
      tick,
      liquidity,
      price,
    }
  } catch (error) {
    console.error('Failed to fetch pool state:', error)
    return null
  }
}

/**
 * usePools Hook
 *
 * @returns Pool data with on-chain state
 */
export function usePools() {
  const chainId = useChainId()
  const publicClient = usePublicClient()
  const isDexAvailable = hasDexSupport(chainId)

  // Get known pools for current chain
  const pools = getPools(chainId)

  // Fetch pool states
  const {
    data: poolStates,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['pools', chainId, pools.map(p => p.address).join(',')],
    queryFn: async () => {
      if (!publicClient || !isDexAvailable || pools.length === 0) {
        return []
      }

      const states = await Promise.all(
        pools.map(async pool => {
          const state = await fetchPoolState(publicClient, pool.address)
          return {
            ...pool,
            state: state || undefined,
            // Mock TVL/APR/Volume for now - would need indexer for real data
            tvl: state ? Math.random() * 1000000 + 100000 : 0,
            apr: Math.random() * 20 + 5,
            volume24h: Math.random() * 500000 + 50000,
          } as PoolWithState
        })
      )

      return states
    },
    enabled: isDexAvailable && pools.length > 0,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  })

  return {
    pools: poolStates || pools.map(p => ({ ...p } as PoolWithState)),
    isLoading,
    error: error as Error | null,
    refetch,
    isDexAvailable,
    hasData: isDexAvailable && pools.length > 0,
  }
}

export default usePools
