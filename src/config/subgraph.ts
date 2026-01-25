/**
 * Subgraph Configuration for 0G Networks
 *
 * Config-driven architecture for AMM data sources.
 * Subgraph URLs are loaded from environment variables for security.
 *
 * Setup:
 * 1. Copy .env.example to .env
 * 2. Set VITE_SUBGRAPH_URL_MAINNET with your Goldsky/Graph URL
 *
 * To switch AMMs, also update:
 * - DEFAULT_CHART_POOLS with the main trading pairs
 * - FEATURED_POOLS with pools to highlight
 * - AMM_CONFIG with branding info
 */

import { CHAIN_IDS } from './chains'

/**
 * Subgraph URL configuration by chain
 *
 * URLs loaded from environment variables:
 * - VITE_SUBGRAPH_URL_MAINNET: 0G Mainnet subgraph
 * - VITE_SUBGRAPH_URL_TESTNET: 0G Testnet subgraph (optional)
 *
 * For Goldsky, URL format is:
 * https://api.goldsky.com/api/public/{PROJECT_ID}/subgraphs/{NAME}/{VERSION}/gn
 */
export const SUBGRAPH_URLS: Record<number, string | null> = {
  // 0G Mainnet - Load from env var
  [CHAIN_IDS.MAINNET]: import.meta.env.VITE_SUBGRAPH_URL_MAINNET || null,

  // 0G Testnet - Load from env var (optional)
  [CHAIN_IDS.TESTNET]: import.meta.env.VITE_SUBGRAPH_URL_TESTNET || null,
}

/**
 * Default pools for chart display by chain
 * These are the main trading pairs shown in the chart panel
 */
export const DEFAULT_CHART_POOLS: Record<number, string | null> = {
  // W0G/USDC.e pool - highest liquidity on Janie
  [CHAIN_IDS.MAINNET]: '0xa9e824eddb9677fb2189ab9c439238a83695c091',

  // No pools on testnet
  [CHAIN_IDS.TESTNET]: null,
}

/**
 * Featured/Main pools for quick access
 * Used for pool selectors and featured displays
 */
export interface FeaturedPool {
  id: string
  address: `0x${string}`
  name: string
  description?: string
}

export const FEATURED_POOLS: Record<number, FeaturedPool[]> = {
  [CHAIN_IDS.MAINNET]: [
    {
      id: 'w0g-usdc',
      address: '0xa9e824eddb9677fb2189ab9c439238a83695c091',
      name: 'W0G/USDC.e',
      description: 'Main liquidity pool',
    },
    {
      id: 'usdc-cbbtc',
      address: '0x2bd550e4a9ab4fcb886f64475664a705a00b8481',
      name: 'USDC.e/cbBTC',
      description: 'Bitcoin trading pair',
    },
    {
      id: 'usdc-weth',
      address: '0x411e76f26c684580edfd0867be181bba5a3a98a5',
      name: 'USDC.e/wETH',
      description: 'Ethereum trading pair',
    },
    {
      id: 'w0g-st0g',
      address: '0x18bad16195276c998e7c4637857532730c651d76',
      name: 'W0G/st0G',
      description: 'Staking pair',
    },
    {
      id: 'w0g-pai',
      address: '0x224d0891d63ca83e6dd98b4653c27034503a5e76',
      name: 'W0G/PAI',
      description: 'PAI stablecoin pair',
    },
  ],
  [CHAIN_IDS.TESTNET]: [],
}

/**
 * AMM Protocol metadata
 * Used for branding and display purposes
 */
export interface AMMConfig {
  name: string
  protocol: 'uniswap-v3' | 'uniswap-v2' | 'custom'
  website?: string
  docs?: string
}

export const AMM_CONFIG: Record<number, AMMConfig | null> = {
  [CHAIN_IDS.MAINNET]: {
    name: 'Janie',
    protocol: 'uniswap-v3',
    website: 'https://janie.exchange',
    docs: 'https://docs.janie.exchange',
  },
  [CHAIN_IDS.TESTNET]: null,
}

// Helper functions

/**
 * Get subgraph URL for a chain
 */
export function getSubgraphUrl(chainId: number): string | null {
  return SUBGRAPH_URLS[chainId] ?? null
}

/**
 * Check if subgraph is available for a chain
 */
export function hasSubgraphSupport(chainId: number): boolean {
  return SUBGRAPH_URLS[chainId] != null
}

/**
 * Get default chart pool address for a chain
 */
export function getDefaultChartPool(chainId: number): string | null {
  return DEFAULT_CHART_POOLS[chainId] ?? null
}

/**
 * Get featured pools for a chain
 */
export function getFeaturedPools(chainId: number): FeaturedPool[] {
  return FEATURED_POOLS[chainId] ?? []
}

/**
 * Get AMM config for a chain
 */
export function getAMMConfig(chainId: number): AMMConfig | null {
  return AMM_CONFIG[chainId] ?? null
}

/**
 * Get a featured pool by ID
 */
export function getFeaturedPoolById(
  chainId: number,
  poolId: string
): FeaturedPool | undefined {
  const pools = getFeaturedPools(chainId)
  return pools.find(p => p.id === poolId)
}

/**
 * Get a featured pool by address
 */
export function getFeaturedPoolByAddress(
  chainId: number,
  address: string
): FeaturedPool | undefined {
  const pools = getFeaturedPools(chainId)
  return pools.find(p => p.address.toLowerCase() === address.toLowerCase())
}
