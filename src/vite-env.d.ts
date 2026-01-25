/// <reference types="vite/client" />

/**
 * Environment Variables Type Definitions
 *
 * These variables are loaded from .env files (local) or deployment platform (Vercel).
 * All client-exposed variables must be prefixed with VITE_
 */
interface ImportMetaEnv {
  // Subgraph URLs for DEX data
  readonly VITE_SUBGRAPH_URL_MAINNET?: string
  readonly VITE_SUBGRAPH_URL_TESTNET?: string

  // Optional: WalletConnect Project ID
  readonly VITE_WALLETCONNECT_PROJECT_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
