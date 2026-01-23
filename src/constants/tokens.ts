/**
 * Token Definitions for 0G Galileo Testnet
 *
 * NOTE: ERC-20 token addresses are placeholders.
 * Replace with actual addresses when available from Jaine DEX or 0G team.
 */

export interface Token {
  address: `0x${string}` | 'native'
  symbol: string
  name: string
  decimals: number
  logoURI: string
  isNative?: boolean
}

// Native 0G token (no contract address needed)
export const NATIVE_TOKEN: Token = {
  address: 'native',
  symbol: '0G',
  name: '0G Token',
  decimals: 18,
  logoURI: '/tokens/0g.svg',
  isNative: true,
}

// ERC-20 Tokens (addresses are placeholders - replace when available)
export const TOKENS: Token[] = [
  NATIVE_TOKEN,
  {
    address: '0x0000000000000000000000000000000000000001', // Placeholder
    symbol: 'st0G',
    name: 'Staked 0G',
    decimals: 18,
    logoURI: '/tokens/st0g.svg',
  },
  {
    address: '0x0000000000000000000000000000000000000002', // Placeholder
    symbol: 'USDCe',
    name: 'Bridged USDC',
    decimals: 6,
    logoURI: '/tokens/usdc.svg',
  },
  {
    address: '0x0000000000000000000000000000000000000003', // Placeholder
    symbol: 'wETH',
    name: 'Wrapped ETH',
    decimals: 18,
    logoURI: '/tokens/weth.svg',
  },
  {
    address: '0x0000000000000000000000000000000000000004', // Placeholder
    symbol: 'PAI',
    name: 'PAI Token',
    decimals: 18,
    logoURI: '/tokens/pai.svg',
  },
]

// Token lookup by symbol
export const TOKEN_BY_SYMBOL: Record<string, Token> = TOKENS.reduce(
  (acc, token) => {
    acc[token.symbol] = token
    return acc
  },
  {} as Record<string, Token>
)

// Token lookup by address
export const TOKEN_BY_ADDRESS: Record<string, Token> = TOKENS.reduce(
  (acc, token) => {
    if (token.address !== 'native') {
      acc[token.address.toLowerCase()] = token
    }
    return acc
  },
  {} as Record<string, Token>
)

// Default token pair for swap
export const DEFAULT_FROM_TOKEN = NATIVE_TOKEN
export const DEFAULT_TO_TOKEN = TOKENS[2] // USDCe

// Contract addresses (placeholders - replace when Jaine DEX available)
export const CONTRACTS = {
  // DEX Router (Jaine or similar)
  ROUTER: '0x0000000000000000000000000000000000000000' as `0x${string}`,

  // DEX Factory
  FACTORY: '0x0000000000000000000000000000000000000000' as `0x${string}`,

  // Wrapped native token (W0G)
  WRAPPED_NATIVE: '0x0000000000000000000000000000000000000000' as `0x${string}`,
}

// Demo mode flag - set to false when real contracts are available
export const IS_DEMO_MODE = true
