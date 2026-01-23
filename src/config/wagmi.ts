import '@rainbow-me/rainbowkit/styles.css'

import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { http } from 'wagmi'
import { zgMainnet, zgTestnet, defaultChain } from './chains'

/**
 * Wagmi + RainbowKit Configuration
 *
 * Supports both 0G networks:
 * - Mainnet (16661): Real swaps via Janie DEX
 * - Testnet (16602): Development/testing (demo mode)
 *
 * Wallets:
 * - MetaMask
 * - WalletConnect
 * - Coinbase Wallet
 * - Rainbow Wallet
 */
export const config = getDefaultConfig({
  appName: '0G Swap',
  projectId: 'YOUR_WALLETCONNECT_PROJECT_ID', // Get one at https://cloud.walletconnect.com
  chains: [zgMainnet, zgTestnet],
  transports: {
    [zgMainnet.id]: http(zgMainnet.rpcUrls.default.http[0]),
    [zgTestnet.id]: http(zgTestnet.rpcUrls.default.http[0]),
  },
  ssr: false,
})

// Default chain for the app
export { defaultChain }

// RainbowKit theme customization
export const rainbowTheme = {
  accentColor: '#8B5CF6',
  accentColorForeground: 'white',
  borderRadius: 'large' as const,
  fontStack: 'system' as const,
  overlayBlur: 'small' as const,
}
