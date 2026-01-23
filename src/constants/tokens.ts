/**
 * Token Definitions for 0G Networks
 *
 * Mainnet (16661): Real token addresses from Janie DEX
 * Testnet (16602): Demo tokens (only native 0G works)
 *
 * To add new tokens:
 * 1. Add to the appropriate network's token list
 * 2. Ensure decimals are correct (USDC = 6, most others = 18)
 * 3. Add token icon to public/tokens/
 */

import { CHAIN_IDS } from '@/config/chains'
import { isDexAvailable } from './contracts'

export interface Token {
  address: `0x${string}` | 'native'
  symbol: string
  name: string
  decimals: number
  logoURI: string
  isNative?: boolean
}

// Native 0G token (same on all networks)
export const NATIVE_TOKEN: Token = {
  address: 'native',
  symbol: '0G',
  name: '0G Token',
  decimals: 18,
  logoURI: '/tokens/0g.svg',
  isNative: true,
}

// Token definitions by network
const MAINNET_TOKENS: Token[] = [
  NATIVE_TOKEN,
  {
    address: '0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c',
    symbol: 'W0G',
    name: 'Wrapped 0G',
    decimals: 18,
    logoURI: '/tokens/0g.svg',
  },
  {
    address: '0x1f3aa82227281ca364bfb3d253b0f1af1da6473e',
    symbol: 'USDC.e',
    name: 'Bridged USDC',
    decimals: 6,
    logoURI: '/tokens/usdc.svg',
  },
  // Add more mainnet tokens here as they become available
  // {
  //   address: '0x...',
  //   symbol: 'wETH',
  //   name: 'Wrapped ETH',
  //   decimals: 18,
  //   logoURI: '/tokens/weth.svg',
  // },
]

const TESTNET_TOKENS: Token[] = [
  NATIVE_TOKEN,
  // Testnet placeholder tokens (for UI testing only)
  {
    address: '0x0000000000000000000000000000000000000001',
    symbol: 'st0G',
    name: 'Staked 0G',
    decimals: 18,
    logoURI: '/tokens/st0g.svg',
  },
  {
    address: '0x0000000000000000000000000000000000000002',
    symbol: 'USDCe',
    name: 'Bridged USDC',
    decimals: 6,
    logoURI: '/tokens/usdc.svg',
  },
  {
    address: '0x0000000000000000000000000000000000000003',
    symbol: 'wETH',
    name: 'Wrapped ETH',
    decimals: 18,
    logoURI: '/tokens/weth.svg',
  },
]

// Tokens by chain ID
export const TOKENS_BY_CHAIN: Record<number, Token[]> = {
  [CHAIN_IDS.MAINNET]: MAINNET_TOKENS,
  [CHAIN_IDS.TESTNET]: TESTNET_TOKENS,
}

// Helper to get tokens for a specific chain
export function getTokens(chainId: number): Token[] {
  return TOKENS_BY_CHAIN[chainId] || TESTNET_TOKENS
}

// Helper to get token by symbol
export function getTokenBySymbol(chainId: number, symbol: string): Token | undefined {
  const tokens = getTokens(chainId)
  return tokens.find(t => t.symbol.toLowerCase() === symbol.toLowerCase())
}

// Helper to get token by address
export function getTokenByAddress(chainId: number, address: string): Token | undefined {
  const tokens = getTokens(chainId)
  if (address === 'native') return NATIVE_TOKEN
  return tokens.find(t => t.address.toLowerCase() === address.toLowerCase())
}

// Default tokens for swap (network-aware)
export function getDefaultTokenPair(chainId: number): { from: Token; to: Token } {
  const tokens = getTokens(chainId)
  const from = NATIVE_TOKEN

  // Try to find USDC variant for "to" token
  const to = tokens.find(t =>
    t.symbol.toLowerCase().includes('usdc') && !t.isNative
  ) || tokens[1] || NATIVE_TOKEN

  return { from, to }
}

// Check if swap is possible (not demo mode)
export function isRealSwapAvailable(chainId: number): boolean {
  return isDexAvailable(chainId)
}

// Legacy exports for backward compatibility
export const TOKENS = MAINNET_TOKENS
export const DEFAULT_FROM_TOKEN = NATIVE_TOKEN
export const DEFAULT_TO_TOKEN = MAINNET_TOKENS[2] // USDC.e
export const IS_DEMO_MODE = false // Now determined by chain, not global flag

// Legacy lookups (use getTokenBySymbol/getTokenByAddress instead)
export const TOKEN_BY_SYMBOL: Record<string, Token> = MAINNET_TOKENS.reduce(
  (acc, token) => {
    acc[token.symbol] = token
    return acc
  },
  {} as Record<string, Token>
)

export const TOKEN_BY_ADDRESS: Record<string, Token> = MAINNET_TOKENS.reduce(
  (acc, token) => {
    if (token.address !== 'native') {
      acc[token.address.toLowerCase()] = token
    }
    return acc
  },
  {} as Record<string, Token>
)
