/**
 * Contract Addresses for 0G Networks
 *
 * Mainnet (16661): Real Janie DEX contracts (Uniswap V3 style)
 * Testnet (16602): No DEX deployed - demo mode only
 *
 * To add new contracts or tokens:
 * 1. Add the address to the appropriate network section
 * 2. Tokens go in tokens.ts, contracts go here
 */

import { CHAIN_IDS } from '@/config/chains'

// Contract addresses by network
export const CONTRACTS = {
  // 0G Mainnet - Janie DEX (Verified)
  [CHAIN_IDS.MAINNET]: {
    // Uniswap V3 style SwapRouter
    ROUTER: '0x8b598a7c136215a95ba0282b4d832b9f9801f2e2' as const,
    // Uniswap V3 style Factory
    FACTORY: '0x9bdca5798e52e592a08e3b34d3f18eef76af7ef4' as const,
    // Wrapped native token (W0G)
    WRAPPED_NATIVE: '0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c' as const,
  },

  // 0G Testnet - No DEX deployed
  [CHAIN_IDS.TESTNET]: {
    ROUTER: null,
    FACTORY: null,
    WRAPPED_NATIVE: null,
  },
} as const

// Known liquidity pools (Mainnet only)
export const POOLS = {
  [CHAIN_IDS.MAINNET]: {
    // W0G / USDC.e with 0.3% fee tier
    'W0G_USDC_3000': '0xa9e824eddb9677fb2189ab9c439238a83695c091' as const,
  },
  [CHAIN_IDS.TESTNET]: {},
} as const

// Fee tiers for Uniswap V3 style DEX
export const FEE_TIERS = {
  LOWEST: 100,    // 0.01%
  LOW: 500,       // 0.05%
  MEDIUM: 3000,   // 0.3% - Most common, verified working
  HIGH: 10000,    // 1%
} as const

// Default fee tier
export const DEFAULT_FEE_TIER = FEE_TIERS.MEDIUM

// Helper to get contracts for a specific chain
export function getContracts(chainId: number) {
  return CONTRACTS[chainId as keyof typeof CONTRACTS] || CONTRACTS[CHAIN_IDS.TESTNET]
}

// Helper to check if DEX is available on chain
export function isDexAvailable(chainId: number): boolean {
  const contracts = getContracts(chainId)
  return contracts.ROUTER !== null
}

// Helper to get router address (throws if not available)
export function getRouterAddress(chainId: number): `0x${string}` {
  const contracts = getContracts(chainId)
  if (!contracts.ROUTER) {
    throw new Error(`No DEX router available on chain ${chainId}`)
  }
  return contracts.ROUTER
}

// Helper to get wrapped native token address
export function getWrappedNativeAddress(chainId: number): `0x${string}` | null {
  const contracts = getContracts(chainId)
  return contracts.WRAPPED_NATIVE
}
