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

export interface Bundle {
  id: string
  ethPriceUSD: string
}

export interface TokenPrice {
  id: string
  symbol: string
  derivedETH: string
  priceUSD: number
}

export interface SubgraphSwap {
  id: string
  timestamp: string
  origin: string
  amount0: string
  amount1: string
  amountUSD: string
  pool: {
    token0: SubgraphToken
    token1: SubgraphToken
  }
}

export interface SubgraphMint {
  id: string
  timestamp: string
  origin: string
  amount0: string
  amount1: string
  amountUSD: string
  pool: {
    token0: SubgraphToken
    token1: SubgraphToken
  }
}

export interface SubgraphBurn {
  id: string
  timestamp: string
  origin: string
  amount0: string
  amount1: string
  amountUSD: string
  pool: {
    token0: SubgraphToken
    token1: SubgraphToken
  }
}

export interface UserTransaction {
  id: string
  type: 'swap' | 'add' | 'remove'
  timestamp: number
  token0Symbol: string
  token1Symbol: string
  amount0: number
  amount1: number
  amountUSD: number
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
 * Fetch ETH/native token price in USD from bundle
 */
export async function fetchBundlePrice(
  chainId: number = CHAIN_IDS.MAINNET
): Promise<number | null> {
  if (!hasSubgraphSupport(chainId)) {
    return null
  }

  const data = await querySubgraph<{ bundle: Bundle | null }>(
    chainId,
    `
    {
      bundle(id: "1") {
        id
        ethPriceUSD
      }
    }
  `
  )

  if (data.bundle) {
    return parseFloat(data.bundle.ethPriceUSD)
  }
  return null
}

/**
 * Fetch token prices by addresses
 * Returns USD price for each token using derivedETH * ethPriceUSD
 */
export async function fetchTokenPrices(
  chainId: number = CHAIN_IDS.MAINNET,
  tokenAddresses: string[]
): Promise<Map<string, number>> {
  const priceMap = new Map<string, number>()

  if (!hasSubgraphSupport(chainId) || tokenAddresses.length === 0) {
    return priceMap
  }

  // Build query for multiple tokens
  const addressList = tokenAddresses
    .map(a => `"${a.toLowerCase()}"`)
    .join(', ')

  const [bundleData, tokensData] = await Promise.all([
    querySubgraph<{ bundle: Bundle | null }>(
      chainId,
      `{ bundle(id: "1") { ethPriceUSD } }`
    ),
    querySubgraph<{ tokens: Array<{ id: string; symbol: string; derivedETH: string }> }>(
      chainId,
      `
      {
        tokens(where: { id_in: [${addressList}] }) {
          id
          symbol
          derivedETH
        }
      }
    `
    ),
  ])

  const ethPriceUSD = bundleData.bundle
    ? parseFloat(bundleData.bundle.ethPriceUSD)
    : 0

  for (const token of tokensData.tokens) {
    const derivedETH = parseFloat(token.derivedETH)
    const priceUSD = derivedETH * ethPriceUSD
    priceMap.set(token.id.toLowerCase(), priceUSD)
  }

  return priceMap
}

/**
 * Fetch all token prices (for portfolio valuation)
 */
export async function fetchAllTokenPrices(
  chainId: number = CHAIN_IDS.MAINNET
): Promise<Map<string, number>> {
  const priceMap = new Map<string, number>()

  if (!hasSubgraphSupport(chainId)) {
    return priceMap
  }

  const [bundleData, tokensData] = await Promise.all([
    querySubgraph<{ bundle: Bundle | null }>(
      chainId,
      `{ bundle(id: "1") { ethPriceUSD } }`
    ),
    querySubgraph<{ tokens: Array<{ id: string; symbol: string; derivedETH: string }> }>(
      chainId,
      `
      {
        tokens(first: 100, orderBy: totalValueLockedUSD, orderDirection: desc) {
          id
          symbol
          derivedETH
        }
      }
    `
    ),
  ])

  const ethPriceUSD = bundleData.bundle
    ? parseFloat(bundleData.bundle.ethPriceUSD)
    : 0

  // Store ETH price for native token lookups
  priceMap.set('native', ethPriceUSD)

  for (const token of tokensData.tokens) {
    const derivedETH = parseFloat(token.derivedETH)
    const priceUSD = derivedETH * ethPriceUSD
    priceMap.set(token.id.toLowerCase(), priceUSD)
    // Also store by symbol for convenience
    priceMap.set(token.symbol.toLowerCase(), priceUSD)
  }

  return priceMap
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

/**
 * Fetch user's recent transactions (swaps, adds, removes)
 */
export async function fetchUserTransactions(
  chainId: number = CHAIN_IDS.MAINNET,
  userAddress: string,
  limit = 20
): Promise<UserTransaction[]> {
  if (!hasSubgraphSupport(chainId)) {
    return []
  }

  const address = userAddress.toLowerCase()

  // Fetch swaps, mints, and burns in parallel
  const [swapsData, mintsData, burnsData] = await Promise.all([
    querySubgraph<{ swaps: SubgraphSwap[] }>(
      chainId,
      `
      {
        swaps(
          first: ${limit}
          orderBy: timestamp
          orderDirection: desc
          where: { origin: "${address}" }
        ) {
          id
          timestamp
          origin
          amount0
          amount1
          amountUSD
          pool {
            token0 { symbol }
            token1 { symbol }
          }
        }
      }
    `
    ),
    querySubgraph<{ mints: SubgraphMint[] }>(
      chainId,
      `
      {
        mints(
          first: ${limit}
          orderBy: timestamp
          orderDirection: desc
          where: { origin: "${address}" }
        ) {
          id
          timestamp
          origin
          amount0
          amount1
          amountUSD
          pool {
            token0 { symbol }
            token1 { symbol }
          }
        }
      }
    `
    ),
    querySubgraph<{ burns: SubgraphBurn[] }>(
      chainId,
      `
      {
        burns(
          first: ${limit}
          orderBy: timestamp
          orderDirection: desc
          where: { origin: "${address}" }
        ) {
          id
          timestamp
          origin
          amount0
          amount1
          amountUSD
          pool {
            token0 { symbol }
            token1 { symbol }
          }
        }
      }
    `
    ),
  ])

  // Convert to unified format
  const transactions: UserTransaction[] = []

  for (const swap of swapsData.swaps) {
    transactions.push({
      id: swap.id,
      type: 'swap',
      timestamp: parseInt(swap.timestamp),
      token0Symbol: swap.pool.token0.symbol,
      token1Symbol: swap.pool.token1.symbol,
      amount0: Math.abs(parseFloat(swap.amount0)),
      amount1: Math.abs(parseFloat(swap.amount1)),
      amountUSD: parseFloat(swap.amountUSD),
    })
  }

  for (const mint of mintsData.mints) {
    transactions.push({
      id: mint.id,
      type: 'add',
      timestamp: parseInt(mint.timestamp),
      token0Symbol: mint.pool.token0.symbol,
      token1Symbol: mint.pool.token1.symbol,
      amount0: Math.abs(parseFloat(mint.amount0)),
      amount1: Math.abs(parseFloat(mint.amount1)),
      amountUSD: parseFloat(mint.amountUSD),
    })
  }

  for (const burn of burnsData.burns) {
    transactions.push({
      id: burn.id,
      type: 'remove',
      timestamp: parseInt(burn.timestamp),
      token0Symbol: burn.pool.token0.symbol,
      token1Symbol: burn.pool.token1.symbol,
      amount0: Math.abs(parseFloat(burn.amount0)),
      amount1: Math.abs(parseFloat(burn.amount1)),
      amountUSD: parseFloat(burn.amountUSD),
    })
  }

  // Sort by timestamp descending
  transactions.sort((a, b) => b.timestamp - a.timestamp)

  // Return top N
  return transactions.slice(0, limit)
}

export default {
  fetchFactoryStats,
  fetchTopPools,
  fetchPool,
  fetchTopTokens,
  fetchBundlePrice,
  fetchTokenPrices,
  fetchAllTokenPrices,
  fetchPoolDayData,
  fetchPoolHourData,
  fetchCurrentPrice,
  fetchUserTransactions,
}
