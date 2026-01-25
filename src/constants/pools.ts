/**
 * Pool Configuration for 0G Networks
 *
 * Defines known liquidity pools for the DEX.
 * Used by PoolsPanel to display available pools.
 */

import { CHAIN_IDS } from '@/config/chains'
import { type Token, getTokenByAddress } from './tokens'

export interface PoolConfig {
  id: string
  address: `0x${string}`
  token0Address: `0x${string}`
  token1Address: `0x${string}`
  fee: number // Fee tier in basis points (3000 = 0.3%)
  name?: string
  description?: string
}

export interface Pool extends PoolConfig {
  token0: Token | undefined
  token1: Token | undefined
}

// Known pools by chain (manual config for verified pools)
export const KNOWN_POOLS: Record<number, PoolConfig[]> = {
  [CHAIN_IDS.MAINNET]: [
    {
      id: 'w0g-usdc-3000',
      address: '0xa9e824eddb9677fb2189ab9c439238a83696c091',
      token0Address: '0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c', // W0G
      token1Address: '0x1f3aa82227281ca364bfb3d253b0f1af1da6473e', // USDC.e
      fee: 3000, // 0.3%
      name: 'W0G/USDC.e',
      description: 'Main liquidity pool for W0G',
    },
    // Add more pools as they are discovered
  ],
  [CHAIN_IDS.TESTNET]: [
    // No real pools on testnet - demo mode only
  ],
}

/**
 * Get pools for a chain with token data populated
 */
export function getPools(chainId: number): Pool[] {
  const poolConfigs = KNOWN_POOLS[chainId] || []

  return poolConfigs.map(config => ({
    ...config,
    token0: getTokenByAddress(chainId, config.token0Address),
    token1: getTokenByAddress(chainId, config.token1Address),
  }))
}

/**
 * Get a specific pool by ID
 */
export function getPoolById(chainId: number, poolId: string): Pool | undefined {
  const pools = getPools(chainId)
  return pools.find(p => p.id === poolId)
}

/**
 * Check if pools feature is available on chain
 */
export function hasPoolsSupport(chainId: number): boolean {
  return (KNOWN_POOLS[chainId]?.length || 0) > 0
}

/**
 * Fee tier labels
 */
export const FEE_TIER_LABELS: Record<number, string> = {
  100: '0.01%',
  500: '0.05%',
  3000: '0.3%',
  10000: '1%',
}

/**
 * Get fee tier display string
 */
export function getFeeTierLabel(fee: number): string {
  return FEE_TIER_LABELS[fee] || `${fee / 10000}%`
}
