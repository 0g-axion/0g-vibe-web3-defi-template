import '@rainbow-me/rainbowkit/styles.css'

import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { http } from 'wagmi'
import { zgGalileo } from './chains'

/**
 * Wagmi + RainbowKit Configuration
 *
 * Configured for 0G Galileo Testnet with:
 * - MetaMask
 * - WalletConnect
 * - Coinbase Wallet
 * - Rainbow Wallet
 */
export const config = getDefaultConfig({
  appName: '0G Swap',
  projectId: 'YOUR_WALLETCONNECT_PROJECT_ID', // Get one at https://cloud.walletconnect.com
  chains: [zgGalileo],
  transports: {
    [zgGalileo.id]: http(zgGalileo.rpcUrls.default.http[0]),
  },
  ssr: false,
})

// RainbowKit theme customization
export const rainbowTheme = {
  accentColor: '#8B5CF6',
  accentColorForeground: 'white',
  borderRadius: 'large' as const,
  fontStack: 'system' as const,
  overlayBlur: 'small' as const,
}
