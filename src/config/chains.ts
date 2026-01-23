import { defineChain } from 'viem'

/**
 * 0G Galileo Testnet Chain Configuration
 *
 * Network Details:
 * - Chain ID: 16602
 * - Native Token: 0G (18 decimals)
 * - RPC: https://evmrpc-testnet.0g.ai
 * - Explorer: https://chainscan-galileo.0g.ai
 * - Faucet: https://faucet.0g.ai
 */
export const zgGalileo = defineChain({
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

// Export chain metadata for UI components
export const chainMetadata = {
  id: zgGalileo.id,
  name: zgGalileo.name,
  nativeCurrency: zgGalileo.nativeCurrency,
  faucetUrl: 'https://faucet.0g.ai',
  explorerUrl: zgGalileo.blockExplorers.default.url,
  rpcUrl: zgGalileo.rpcUrls.default.http[0],
}
