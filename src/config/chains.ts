import { defineChain } from 'viem'

/**
 * 0G Chain Definitions
 *
 * Supports both Mainnet (for real swaps) and Testnet (for development).
 * DEX contracts (Janie) are only deployed on Mainnet.
 */

/**
 * 0G Mainnet Chain Configuration
 *
 * Network Details:
 * - Chain ID: 16661
 * - Native Token: 0G (18 decimals)
 * - RPC: https://evmrpc.0g.ai
 * - Explorer: https://chainscan.0g.ai
 * - DEX: Janie (Uniswap V3 style)
 */
export const zgMainnet = defineChain({
  id: 16661,
  name: '0G-Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: '0G',
    symbol: '0G',
  },
  rpcUrls: {
    default: {
      http: ['https://evmrpc.0g.ai']
    },
    public: {
      http: ['https://evmrpc.0g.ai']
    },
  },
  blockExplorers: {
    default: {
      name: '0G Explorer',
      url: 'https://chainscan.0g.ai',
    },
  },
  testnet: false,
})

/**
 * 0G Galileo Testnet Chain Configuration
 *
 * Network Details:
 * - Chain ID: 16602
 * - Native Token: 0G (18 decimals)
 * - RPC: https://evmrpc-testnet.0g.ai
 * - Explorer: https://chainscan-galileo.0g.ai
 * - Faucet: https://faucet.0g.ai
 * - Note: No DEX contracts deployed on testnet
 */
export const zgTestnet = defineChain({
  id: 16602,
  name: '0G-Galileo-Testnet',
  nativeCurrency: {
    decimals: 18,
    name: '0G',
    symbol: '0G',
  },
  rpcUrls: {
    default: {
      http: ['https://evmrpc-testnet.0g.ai']
    },
    public: {
      http: ['https://evmrpc-testnet.0g.ai']
    },
  },
  blockExplorers: {
    default: {
      name: '0G Explorer',
      url: 'https://chainscan-galileo.0g.ai',
    },
  },
  testnet: true,
})

// Alias for backward compatibility
export const zgGalileo = zgTestnet

// All supported chains
export const supportedChains = [zgMainnet, zgTestnet] as const

// Default chain (mainnet for real swaps)
export const defaultChain = zgMainnet

// Chain IDs
export const CHAIN_IDS = {
  MAINNET: 16661,
  TESTNET: 16602,
} as const

// Helper to check if chain has DEX support
export const hasDexSupport = (chainId: number): boolean => {
  return chainId === CHAIN_IDS.MAINNET
}

// Export chain metadata for UI components
export const getChainMetadata = (chainId: number) => {
  const chain = chainId === CHAIN_IDS.MAINNET ? zgMainnet : zgTestnet
  return {
    id: chain.id,
    name: chain.name,
    nativeCurrency: chain.nativeCurrency,
    faucetUrl: chainId === CHAIN_IDS.TESTNET ? 'https://faucet.0g.ai' : 'https://hub.0g.ai/bridge',
    explorerUrl: chain.blockExplorers.default.url,
    rpcUrl: chain.rpcUrls.default.http[0],
    hasDex: hasDexSupport(chainId),
  }
}

// Legacy export for backward compatibility
export const chainMetadata = getChainMetadata(CHAIN_IDS.MAINNET)
