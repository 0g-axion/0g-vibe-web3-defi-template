# 0G Web3 DeFi Template Architecture

> **Config-driven, LLM-friendly Web3 template for 0G Network**

This document explains the architecture, configuration system, and contribution guidelines for both human developers and AI coding agents.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Overview](#overview)
3. [Architecture Principles](#architecture-principles)
4. [Configuration System](#configuration-system)
5. [Data Sources](#data-sources)
6. [Feature Flags](#feature-flags)
7. [Directory Structure](#directory-structure)
8. [Deployment](#deployment)
9. [How to Extend](#how-to-extend)
10. [LLM/AI Agent Guidelines](#llmai-agent-guidelines)

---

## Quick Start

### Local Development

```bash
# 1. Clone and install
git clone <repo-url>
cd bolt-web3-defi-template
npm install

# 2. Set up environment variables
cp .env.example .env

# 3. Edit .env with your subgraph URL
# VITE_SUBGRAPH_URL_MAINNET=https://api.goldsky.com/api/public/{PROJECT_ID}/subgraphs/{NAME}/{VERSION}/gn

# 4. Run development server
npm run dev
```

### Deploy to Vercel (One-Click)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/user/repo&env=VITE_SUBGRAPH_URL_MAINNET&envDescription=Subgraph%20URL%20for%20DEX%20data&envLink=https://github.com/user/repo/blob/main/docs/ARCHITECTURE.md#environment-variables)

When deploying, Vercel will prompt you for:
- `VITE_SUBGRAPH_URL_MAINNET` - Your Goldsky/Graph subgraph URL

---

## Overview

This template provides a complete DeFi interface for 0G Network with:

- **Token Swaps** - Swap interface with real-time pricing
- **Liquidity Pools** - View and manage liquidity positions
- **Price Charts** - OHLC candlestick charts with multiple timeframes
- **Portfolio** - Track token balances and activity
- **Wallet Integration** - RainbowKit + wagmi for Web3 connectivity

### Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Web3 | wagmi v2, viem, RainbowKit |
| Data Fetching | TanStack Query (React Query) |
| Styling | Tailwind CSS, Framer Motion |
| Charts | Lightweight Charts (TradingView) |
| Data Source | Goldsky Subgraph (Uniswap V3 schema) |

---

## Architecture Principles

### 1. Config-Driven Design

**All environment-specific values live in config files, not components.**

```
src/config/
├── chains.ts      # Chain definitions, RPC URLs, explorer URLs
├── features.ts    # Feature flags and UI toggles
└── subgraph.ts    # AMM subgraph URLs, default pools, featured pools
```

**Why?** Switching networks, AMMs, or data sources requires only config changes - no component modifications.

### 2. Chain-Aware Functions

All data-fetching functions accept `chainId` as a parameter:

```typescript
// ✅ CORRECT - Config-driven
export async function fetchTopPools(chainId: number, limit = 20) {
  const url = getSubgraphUrl(chainId)  // From config
  // ...
}

// ❌ WRONG - Hardcoded
export async function fetchTopPools() {
  const url = 'https://hardcoded-url.com/graphql'  // Never do this
  // ...
}
```

### 3. Graceful Degradation

Features check availability before rendering:

```typescript
const hasSubgraph = hasSubgraphSupport(chainId)

// Component shows "Demo Mode" badge if no subgraph
// Returns empty arrays instead of crashing
if (!hasSubgraph) return []
```

### 4. Type Safety

All configs have TypeScript interfaces:

```typescript
export interface FeaturedPool {
  id: string
  address: `0x${string}`
  name: string
  description?: string
}
```

---

## Configuration System

### Chain Configuration (`src/config/chains.ts`)

Defines supported networks and their metadata.

```typescript
// Chain IDs
export const CHAIN_IDS = {
  MAINNET: 16661,
  TESTNET: 16602,
} as const

// Get chain metadata for UI
export function getChainMetadata(chainId: number) {
  return {
    id: chain.id,
    name: '0G Mainnet',
    explorerUrl: 'https://chainscan.0g.ai',
    rpcUrl: 'https://evmrpc.0g.ai',
    hasDex: true,
    // ...
  }
}
```

**To add a new chain:**
1. Add chain ID to `CHAIN_IDS`
2. Create chain definition with `defineChain()`
3. Add to `supportedChains` array
4. Update `getChainMetadata()` switch/mapping

### Subgraph Configuration (`src/config/subgraph.ts`)

Defines AMM data sources per chain. **URLs are loaded from environment variables for security.**

```typescript
// Subgraph URLs loaded from environment variables
export const SUBGRAPH_URLS: Record<number, string | null> = {
  [CHAIN_IDS.MAINNET]: import.meta.env.VITE_SUBGRAPH_URL_MAINNET || null,
  [CHAIN_IDS.TESTNET]: import.meta.env.VITE_SUBGRAPH_URL_TESTNET || null,
}
```

**Setup:**
```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env and set your subgraph URL
# For Goldsky: https://api.goldsky.com/api/public/{PROJECT_ID}/subgraphs/{NAME}/{VERSION}/gn
VITE_SUBGRAPH_URL_MAINNET=https://your-subgraph-url
```

// Default pool for chart display
export const DEFAULT_CHART_POOLS: Record<number, string | null> = {
  [CHAIN_IDS.MAINNET]: '0xa9e824eddb9677fb2189ab9c439238a83695c091',  // W0G/USDC.e
  [CHAIN_IDS.TESTNET]: null,
}

// Featured pools for quick access
export const FEATURED_POOLS: Record<number, FeaturedPool[]> = {
  [CHAIN_IDS.MAINNET]: [
    { id: 'w0g-usdc', address: '0xa9e8...', name: 'W0G/USDC.e', description: 'Main liquidity pool' },
    // ...
  ],
}

// AMM metadata for branding
export const AMM_CONFIG: Record<number, AMMConfig | null> = {
  [CHAIN_IDS.MAINNET]: {
    name: 'Janie',
    protocol: 'uniswap-v3',
    website: 'https://janie.exchange',
  },
}
```

**To switch to a different AMM:**
1. Update `SUBGRAPH_URLS` with new subgraph endpoint
2. Update `DEFAULT_CHART_POOLS` with main trading pair
3. Update `FEATURED_POOLS` with pools to highlight
4. Update `AMM_CONFIG` with branding info
5. If schema differs from Uniswap V3, update GraphQL queries in `src/services/subgraph.ts`

### Feature Configuration (`src/config/features.ts`)

Controls what features are visible/enabled.

```typescript
export interface FeatureConfig {
  swap: {
    enabled: boolean
    showChart: boolean
    showPriceImpact: boolean
    // ...
  }
  pools: {
    enabled: boolean
    showMyPositions: boolean
    // ...
  }
  chart: {
    enabled: boolean
    defaultTimeRange: '1H' | '24H' | '7D' | '30D' | '1Y'
    // ...
  }
  // ...
}

// Presets available
export const DEFAULT_FEATURES: FeatureConfig  // All features
export const MINIMAL_FEATURES: FeatureConfig  // Swap only
```

**To customize features:**
```typescript
// In your app, use mergeFeatures for partial overrides
const customFeatures = mergeFeatures(DEFAULT_FEATURES, {
  pools: { enabled: false },
  chart: { defaultTimeRange: '7D' },
})
```

---

## Data Sources

### Subgraph Service (`src/services/subgraph.ts`)

GraphQL queries against Uniswap V3-style subgraph.

| Function | Description | Returns |
|----------|-------------|---------|
| `fetchFactoryStats(chainId)` | Total TVL, volume, pool count | `FactoryStats` |
| `fetchTopPools(chainId, limit)` | Top pools by TVL | `SubgraphPool[]` |
| `fetchPool(chainId, address)` | Single pool details | `SubgraphPool` |
| `fetchTopTokens(chainId, limit)` | Top tokens by TVL | `SubgraphTokenStats[]` |
| `fetchPoolDayData(chainId, address, days)` | Daily OHLC data | `PoolDayData[]` |
| `fetchPoolHourData(chainId, address, hours)` | Hourly OHLC data | `PoolHourData[]` |
| `fetchCurrentPrice(chainId, address)` | Latest price | `number` |

**All functions:**
- Accept `chainId` to get correct subgraph URL
- Return empty/null if subgraph unavailable
- Handle errors gracefully

### React Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useSubgraphPools` | `src/hooks/useSubgraphPools.ts` | Pool list with stats |
| `useChartData` | `src/hooks/useChartData.ts` | OHLC chart data |
| `useCurrentPrice` | `src/hooks/useChartData.ts` | Real-time price |

**Usage:**
```typescript
function PoolsPage() {
  const { pools, stats, isLoading, hasSubgraph } = useSubgraphPools(20)

  if (!hasSubgraph) return <DemoModeMessage />
  if (isLoading) return <Loading />
  return <PoolList pools={pools} />
}
```

---

## Feature Flags

The template uses a `FeatureProvider` context for runtime feature control.

### Usage in Components

```typescript
import { useFeatures } from '@/providers/features'

function SwapPanel() {
  const { features } = useFeatures()

  return (
    <div>
      <SwapForm />
      {features.swap.showChart && <ChartPanel />}
      {features.swap.showPriceImpact && <PriceImpact />}
    </div>
  )
}
```

### Chain-Based Resolution

Features auto-adjust based on chain capabilities:

```typescript
// In features.ts
export function resolveFeatures(config: FeatureConfig, chainId: number): FeatureConfig {
  const hasDex = hasDexSupport(chainId)

  return {
    ...config,
    pools: {
      ...config.pools,
      enabled: config.pools.enabled && hasDex,  // Auto-disable if no DEX
    },
    // ...
  }
}
```

---

## Directory Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home page with swap panel
│   ├── pools/             # Pools page
│   └── layout.tsx         # Root layout with providers
│
├── components/
│   ├── ui/                # Shared UI components (buttons, cards, etc.)
│   └── web3/              # Web3-specific components
│       ├── swap-panel.tsx
│       ├── chart-panel.tsx
│       ├── pools-panel.tsx
│       └── portfolio-panel.tsx
│
├── config/                 # ⭐ CONFIGURATION FILES
│   ├── chains.ts          # Chain definitions
│   ├── features.ts        # Feature flags
│   └── subgraph.ts        # AMM/subgraph config
│
├── constants/              # Static values
│   ├── contracts.ts       # Contract addresses by chain
│   ├── tokens.ts          # Token definitions
│   └── pools.ts           # Pool configurations
│
├── hooks/                  # React hooks
│   ├── useSubgraphPools.ts
│   ├── useChartData.ts
│   └── useTokenBalances.ts
│
├── services/               # API/data services
│   └── subgraph.ts        # GraphQL queries
│
├── providers/              # React context providers
│   ├── web3.tsx           # wagmi/RainbowKit setup
│   └── features.tsx       # Feature flag context
│
└── lib/                    # Utilities
    └── utils.ts
```

---

## Deployment

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUBGRAPH_URL_MAINNET` | Yes | Goldsky/Graph subgraph URL for 0G Mainnet |
| `VITE_SUBGRAPH_URL_TESTNET` | No | Subgraph URL for 0G Testnet (if available) |
| `VITE_WALLETCONNECT_PROJECT_ID` | No | WalletConnect Cloud project ID |

**Subgraph URL format (Goldsky):**
```
https://api.goldsky.com/api/public/{PROJECT_ID}/subgraphs/{SUBGRAPH_NAME}/{VERSION}/gn
```

### Deploy to Vercel

1. **Fork/Clone** this repository
2. **Import to Vercel** at [vercel.com/new](https://vercel.com/new)
3. **Set environment variables** in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add `VITE_SUBGRAPH_URL_MAINNET` with your subgraph URL
4. **Deploy** - Vercel auto-detects Vite and builds correctly

**How it works:**
- Vite exposes `VITE_*` env vars to client code via `import.meta.env`
- Vercel injects env vars at build time
- No server-side code needed - fully static deployment

### Deploy to Other Platforms

**Netlify:**
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  VITE_SUBGRAPH_URL_MAINNET = "your-url-here"
```

**Docker:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
ARG VITE_SUBGRAPH_URL_MAINNET
ENV VITE_SUBGRAPH_URL_MAINNET=$VITE_SUBGRAPH_URL_MAINNET
RUN npm run build
# Serve with nginx or similar
```

**Static hosting (manual build):**
```bash
# Build with env vars
VITE_SUBGRAPH_URL_MAINNET="your-url" npm run build

# Upload dist/ folder to any static host
```

### Without a Subgraph

If `VITE_SUBGRAPH_URL_MAINNET` is not set:
- App runs in **Demo Mode**
- Pools panel shows "Demo Mode" badge
- Charts display placeholder data
- Swap interface still works (connects to DEX contracts directly)

---

## How to Extend

### Adding a New Chain

1. **Update chain config** (`src/config/chains.ts`):
```typescript
export const newChain = defineChain({
  id: 12345,
  name: 'New Chain',
  // ...
})

export const CHAIN_IDS = {
  // ...existing
  NEW_CHAIN: 12345,
}
```

2. **Add subgraph URL** (`src/config/subgraph.ts`):
```typescript
export const SUBGRAPH_URLS = {
  // ...existing
  [CHAIN_IDS.NEW_CHAIN]: 'https://subgraph-url.com/graphql',
}
```

3. **Add contract addresses** (`src/constants/contracts.ts`):
```typescript
export const CONTRACTS = {
  // ...existing
  [CHAIN_IDS.NEW_CHAIN]: {
    ROUTER: '0x...',
    FACTORY: '0x...',
  },
}
```

4. **Add tokens** (`src/constants/tokens.ts`):
```typescript
export const TOKENS = {
  // ...existing
  [CHAIN_IDS.NEW_CHAIN]: [
    { symbol: 'WETH', address: '0x...', decimals: 18 },
  ],
}
```

### Adding a New Feature

1. **Define config interface** (`src/config/features.ts`):
```typescript
export interface NewFeatureConfig {
  enabled: boolean
  option1: string
  option2: boolean
}

export interface FeatureConfig {
  // ...existing
  newFeature: NewFeatureConfig
}
```

2. **Add defaults**:
```typescript
export const DEFAULT_FEATURES: FeatureConfig = {
  // ...existing
  newFeature: {
    enabled: true,
    option1: 'default',
    option2: false,
  },
}
```

3. **Use in component**:
```typescript
const { features } = useFeatures()
if (features.newFeature.enabled) {
  // Render feature
}
```

### Switching AMM/DEX

To use a different AMM (e.g., switch from Janie to another DEX):

1. **Update subgraph URL** (`src/config/subgraph.ts`):
```typescript
export const SUBGRAPH_URLS = {
  [CHAIN_IDS.MAINNET]: 'https://new-subgraph-url.com/graphql',
}
```

2. **Update featured pools**:
```typescript
export const FEATURED_POOLS = {
  [CHAIN_IDS.MAINNET]: [
    { id: 'new-pool', address: '0x...', name: 'NEW/PAIR' },
  ],
}
```

3. **If schema differs from Uniswap V3**, update GraphQL queries in `src/services/subgraph.ts`

---

## LLM/AI Agent Guidelines

This section helps AI coding agents work effectively with this codebase.

### Key Principles for AI

1. **Never hardcode values** - Always use config files
2. **Accept chainId** - All data functions should be chain-aware
3. **Check feature flags** - Wrap features in availability checks
4. **Graceful fallbacks** - Return empty/null, don't throw
5. **Type everything** - Use TypeScript interfaces

### Common Tasks

#### Task: Add a new token

**Files to modify:**
- `src/constants/tokens.ts` - Add token definition

```typescript
// Add to the appropriate chain's token array
[CHAIN_IDS.MAINNET]: [
  // ...existing tokens
  {
    symbol: 'NEW',
    name: 'New Token',
    address: '0x...' as `0x${string}`,
    decimals: 18,
    logoURI: '/tokens/new.png',
  },
]
```

#### Task: Add a new data source

**Files to modify:**
1. `src/config/subgraph.ts` - Add URL config
2. `src/services/subgraph.ts` - Add query function (if needed)
3. `src/hooks/` - Add React hook for the data

**Pattern:**
```typescript
// 1. Config
export const NEW_DATA_URLS: Record<number, string | null> = {
  [CHAIN_IDS.MAINNET]: 'https://...',
}

// 2. Service
export async function fetchNewData(chainId: number) {
  const url = NEW_DATA_URLS[chainId]
  if (!url) return null
  // ...fetch
}

// 3. Hook
export function useNewData() {
  const chainId = useChainId()
  return useQuery({
    queryKey: ['newData', chainId],
    queryFn: () => fetchNewData(chainId),
    enabled: !!NEW_DATA_URLS[chainId],
  })
}
```

#### Task: Modify UI behavior

**Check these files:**
1. `src/config/features.ts` - Is it controlled by a flag?
2. Component file - Direct modification if not flagged

**Pattern:**
```typescript
// If adding toggleable behavior, add to features.ts first
export interface SwapFeatureConfig {
  // ...existing
  newBehavior: boolean  // Add flag
}

// Then use in component
const { features } = useFeatures()
if (features.swap.newBehavior) {
  // New behavior
}
```

### File Modification Checklist

Before modifying any file, verify:

| Check | Why |
|-------|-----|
| Is the value in config? | Don't hardcode |
| Does function accept chainId? | Must be chain-aware |
| Is there a feature flag? | May need to toggle |
| Are types defined? | TypeScript required |
| Is there a fallback? | Handle missing data |

### GraphQL Schema (Uniswap V3)

The subgraph follows Uniswap V3 schema. Key entities:

```graphql
type Factory {
  poolCount: BigInt!
  totalVolumeUSD: BigDecimal!
  totalValueLockedUSD: BigDecimal!
}

type Pool {
  id: ID!  # Pool address
  token0: Token!
  token1: Token!
  feeTier: BigInt!
  liquidity: BigInt!
  totalValueLockedUSD: BigDecimal!
  volumeUSD: BigDecimal!
}

type PoolDayData {
  date: Int!  # Unix timestamp
  volumeUSD: BigDecimal!
  open: BigDecimal!
  high: BigDecimal!
  low: BigDecimal!
  close: BigDecimal!
}

type PoolHourData {
  periodStartUnix: Int!
  volumeUSD: BigDecimal!
  open: BigDecimal!
  high: BigDecimal!
  low: BigDecimal!
  close: BigDecimal!
}
```

### Testing Changes

After modifications:
1. Run `npm run build` - Verify no TypeScript errors
2. Run `npm run dev` - Test in browser
3. Switch networks - Verify chain-specific behavior
4. Check console - No GraphQL or fetch errors

---

## Quick Reference

### Import Patterns

```typescript
// Config imports
import { CHAIN_IDS, getChainMetadata } from '@/config/chains'
import { getSubgraphUrl, hasSubgraphSupport } from '@/config/subgraph'
import { useFeatures } from '@/providers/features'

// Hook imports
import { useSubgraphPools } from '@/hooks/useSubgraphPools'
import { useChartData } from '@/hooks/useChartData'

// Web3 imports
import { useChainId, useAccount } from 'wagmi'
```

### Common Checks

```typescript
// Check if subgraph available
const hasSubgraph = hasSubgraphSupport(chainId)

// Check if DEX available
const hasDex = hasDexSupport(chainId)

// Get explorer URL
const { explorerUrl } = getChainMetadata(chainId)

// Get default pool
const poolAddress = getDefaultChartPool(chainId)
```

---

## Summary

This template is designed for:

1. **Developers** - Clear separation of config and logic
2. **AI Agents** - Predictable patterns, typed configs, explicit guidelines
3. **Flexibility** - Switch chains, AMMs, features via config only

**Golden Rules:**
- Config files are the source of truth
- Functions accept chainId, not hardcoded values
- Features check flags before rendering
- All data functions have fallbacks
