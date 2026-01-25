/**
 * Subgraph Service
 *
 * Fetches real-time data from the configured DEX subgraph.
 * Provides pool data, token prices, and historical OHLC data for charts.
 *
 * This service is config-driven - to switch AMMs:
 * 1. Update src/config/subgraph.ts with new subgraph URL
 * 2. Ensure the subgraph follows Uniswap V3 schema (or modify queries)
 */

import { getSubgraphUrl, hasSubgraphSupport } from '@/config/subgraph'
import { CHAIN_IDS } from '@/config/chains'

// Types
export interface SubgraphToken {
  id: string
  symbol: string
  name: string
  decimals: string
}

export interface SubgraphPool {
  id: string
  token0: SubgraphToken
  token1: SubgraphToken
  feeTier: string
  liquidity: string
  sqrtPrice: string
  totalValueLockedUSD: string
  volumeUSD: string
  feesUSD: string
  txCount: string
}

export interface SubgraphTokenStats {
  id: string
  symbol: string
  name: string
  decimals: string
  totalValueLockedUSD: string
  volumeUSD: string
  txCount: string
  derivedETH: string // Price in terms of wrapped native token
}

export interface PoolDayData {
  date: number
  volumeUSD: string
  tvlUSD: string
  feesUSD: string
  open: string
  high: string
  low: string
  close: string
}

export interface PoolHourData {
  periodStartUnix: number
  volumeUSD: string
  tvlUSD: string
  open: string
  high: string
  low: string
  close: string
}

export interface FactoryStats {
  id: string
  poolCount: string
  txCount: string
  totalVolumeUSD: string
  totalValueLockedUSD: string
}

/**
 * GraphQL query helper
 * Requires chainId to get the correct subgraph URL from config
 */
async function querySubgraph<T>(chainId: number, query: string): Promise<T> {
  const subgraphUrl = getSubgraphUrl(chainId)

  if (!subgraphUrl) {
    throw new Error(`No subgraph available for chain ${chainId}`)
  }

  const response = await fetch(subgraphUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })

  if (!response.ok) {
    throw new Error(`Subgraph query failed: ${response.statusText}`)
  }

  const json = await response.json()

  if (json.errors) {
    throw new Error(`Subgraph error: ${json.errors[0].message}`)
  }

  return json.data
}

/**
 * Fetch factory stats (total TVL, volume, pool count)
 */
export async function fetchFactoryStats(
  chainId: number = CHAIN_IDS.MAINNET
): Promise<FactoryStats | null> {
  if (!hasSubgraphSupport(chainId)) {
    return null
  }

  const data = await querySubgraph<{ factories: FactoryStats[] }>(
    chainId,
    `
    {
      factories(first: 1) {
        id
        poolCount
        txCount
        totalVolumeUSD
        totalValueLockedUSD
      }
    }
  `
  )

  return data.factories[0] || null
}

/**
 * Fetch top pools by TVL
 */
export async function fetchTopPools(
  chainId: number = CHAIN_IDS.MAINNET,
  limit = 20
): Promise<SubgraphPool[]> {
  if (!hasSubgraphSupport(chainId)) {
    return []
  }

  const data = await querySubgraph<{ pools: SubgraphPool[] }>(
    chainId,
    `
    {
      pools(first: ${limit}, orderBy: totalValueLockedUSD, orderDirection: desc) {
        id
        token0 { id symbol name decimals }
        token1 { id symbol name decimals }
        feeTier
        liquidity
        sqrtPrice
        totalValueLockedUSD
        volumeUSD
        feesUSD
        txCount
      }
    }
  `
  )

  return data.pools
}

/**
 * Fetch a specific pool by address
 */
export async function fetchPool(
  chainId: number = CHAIN_IDS.MAINNET,
  poolAddress: string
): Promise<SubgraphPool | null> {
  if (!hasSubgraphSupport(chainId)) {
    return null
  }

  const data = await querySubgraph<{ pool: SubgraphPool | null }>(
    chainId,
    `
    {
      pool(id: "${poolAddress.toLowerCase()}") {
        id
        token0 { id symbol name decimals }
        token1 { id symbol name decimals }
        feeTier
        liquidity
        sqrtPrice
        totalValueLockedUSD
        volumeUSD
        feesUSD
        txCount
      }
    }
  `
  )

  return data.pool
}

/**
 * Fetch top tokens by TVL
 */
export async function fetchTopTokens(
  chainId: number = CHAIN_IDS.MAINNET,
  limit = 20
): Promise<SubgraphTokenStats[]> {
  if (!hasSubgraphSupport(chainId)) {
    return []
  }

  const data = await querySubgraph<{ tokens: SubgraphTokenStats[] }>(
    chainId,
    `
    {
      tokens(first: ${limit}, orderBy: totalValueLockedUSD, orderDirection: desc) {
        id
        symbol
        name
        decimals
        totalValueLockedUSD
        volumeUSD
        txCount
        derivedETH
      }
    }
  `
  )

  return data.tokens
}

/**
 * Fetch daily price data for a pool (for charts)
 */
export async function fetchPoolDayData(
  chainId: number = CHAIN_IDS.MAINNET,
  poolAddress: string,
  days = 30
): Promise<PoolDayData[]> {
  if (!hasSubgraphSupport(chainId)) {
    return []
  }

  const data = await querySubgraph<{ poolDayDatas: PoolDayData[] }>(
    chainId,
    `
    {
      poolDayDatas(
        first: ${days}
        orderBy: date
        orderDirection: desc
        where: { pool: "${poolAddress.toLowerCase()}" }
      ) {
        date
        volumeUSD
        tvlUSD
        feesUSD
        open
        high
        low
        close
      }
    }
  `
  )

  // Return in chronological order (oldest first)
  return data.poolDayDatas.reverse()
}

/**
 * Fetch hourly price data for a pool (for charts)
 */
export async function fetchPoolHourData(
  chainId: number = CHAIN_IDS.MAINNET,
  poolAddress: string,
  hours = 48
): Promise<PoolHourData[]> {
  if (!hasSubgraphSupport(chainId)) {
    return []
  }

  const data = await querySubgraph<{ poolHourDatas: PoolHourData[] }>(
    chainId,
    `
    {
      poolHourDatas(
        first: ${hours}
        orderBy: periodStartUnix
        orderDirection: desc
        where: { pool: "${poolAddress.toLowerCase()}" }
      ) {
        periodStartUnix
        volumeUSD
        tvlUSD
        open
        high
        low
        close
      }
    }
  `
  )

  // Return in chronological order (oldest first)
  return data.poolHourDatas.reverse()
}

/**
 * Get current price for a pool (from latest data)
 */
export async function fetchCurrentPrice(
  chainId: number = CHAIN_IDS.MAINNET,
  poolAddress: string
): Promise<number | null> {
  if (!hasSubgraphSupport(chainId)) {
    return null
  }

  const data = await querySubgraph<{ poolHourDatas: PoolHourData[] }>(
    chainId,
    `
    {
      poolHourDatas(
        first: 1
        orderBy: periodStartUnix
        orderDirection: desc
        where: { pool: "${poolAddress.toLowerCase()}" }
      ) {
        close
      }
    }
  `
  )

  if (data.poolHourDatas.length > 0) {
    return parseFloat(data.poolHourDatas[0].close)
  }

  return null
}

export default {
  fetchFactoryStats,
  fetchTopPools,
  fetchPool,
  fetchTopTokens,
  fetchPoolDayData,
  fetchPoolHourData,
  fetchCurrentPrice,
}
