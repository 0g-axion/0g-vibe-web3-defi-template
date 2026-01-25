# Migration Analysis: New Premium UI Integration

> **Date**: 2026-01-24
> **Commits**: `aeaa165` (New UI) vs `1381d41` (Last Working)
> **Status**: ✅ IMPLEMENTATION COMPLETE

---

## ✅ Implementation Summary (Completed 2026-01-24)

All 5 phases have been successfully implemented:

### Phase 1: Component Restructuring ✅
- Migrated all `dex/` components to `web3/` with kebab-case naming
- Merged layout components into `web3/`
- Updated all imports and barrel exports

### Phase 2: Critical Fixes ✅
- Restored real swap functionality via `useSwap` hook
- Integrated `TxStatusModal` for transaction feedback
- Fixed token balance display and MAX button
- Added approval state handling

### Phase 3: Template Architecture ✅
- Created `src/config/features.ts` with `FeatureConfig` system
- Created `src/providers/feature-provider.tsx` with context
- Made header tabs and panels config-driven
- Updated `.bolt/prompt` documentation

### Phase 4: Config Extensions ✅
- Created `src/constants/pools.ts` with pool configuration
- Created `src/hooks/usePools.ts` for pool data fetching
- Created `src/hooks/usePortfolio.ts` for portfolio balance tracking
- Added "Demo Data" indicators to chart and pools panels
- Integrated real balances into portfolio panel

### Phase 5: Polish & Testing ✅
- Build passes without errors
- Documentation updated
- Feature config system working

---

## Executive Summary

The new premium DEX UI (`aeaa165`) introduces excellent visual improvements and new features (Pools, Chart, Portfolio panels) but **breaks core swap functionality** by replacing the real swap implementation with mock data. Additionally, the new code is not template-friendly (hardcoded features, not config-driven).

### Critical Issues
1. **Broken**: Real V3 swap execution removed
2. **Broken**: Token balance fetching removed
3. **Broken**: Transaction status modal removed
4. **Broken**: Token approval flow removed
5. **Missing**: Config-driven feature toggles for template use

### New Features to Preserve
1. **Keep**: Tab navigation (Swap, Pools, Chart, Portfolio)
2. **Keep**: ChartPanel with price visualization
3. **Keep**: PoolsPanel with liquidity pools UI
4. **Keep**: PortfolioPanel with holdings/activity
5. **Keep**: Premium glassmorphism design improvements
6. **Keep**: New SwapSettings inline panel design

---

## Detailed Gap Analysis

### 1. Swap Functionality (CRITICAL)

#### Old Working Implementation (`src/components/web3/swap-card.tsx`)
```typescript
// WORKING: Uses real swap hook
import { useSwap } from '@/hooks/useSwap'

const { status, error, txHash, getQuote, executeSwap, reset } = useSwap()

// Real quote fetching from pool contracts
const quote = await getQuote({ tokenIn, tokenOut, amountIn })

// Real swap execution with approval flow
const result = await executeSwap({
  tokenIn, tokenOut, amountIn,
  slippagePercent: slippage,
  deadlineMinutes: deadline,
})
```

#### New Broken Implementation (`src/components/dex/SwapPanel.tsx`)
```typescript
// BROKEN: Uses mock data only
const [exchangeRate] = useState(1850) // Hardcoded mock

// Mock quote calculation
const rate = fromToken.symbol === '0G' ? exchangeRate : 1 / exchangeRate
const output = parseFloat(fromAmount) * rate * 0.997

// Fake swap - just delays then clears
const handleSwap = async () => {
  setIsLoading(true)
  await new Promise(r => setTimeout(r, 2000)) // Fake delay
  setIsLoading(false)
  setFromAmount('')
}
```

#### Required Fix
- [ ] Integrate `useSwap` hook into new `SwapPanel`
- [ ] Replace mock quote calculation with `getQuote()` call
- [ ] Replace fake `handleSwap` with `executeSwap()` call
- [ ] Add approval status handling ("Approving..." state)
- [ ] Add `TxStatusModal` for transaction feedback

---

### 2. Token Balance Display (CRITICAL)

#### Old Working Implementation (`src/components/web3/token-input.tsx`)
```typescript
// WORKING: Fetches real balances
import { useAccount, useBalance, useReadContract } from 'wagmi'

// Native balance
const { data: nativeBalance } = useBalance({
  address,
  query: { enabled: token.isNative },
})

// ERC-20 balance
const { data: erc20Balance } = useReadContract({
  address: token.address as `0x${string}`,
  abi: ERC20_ABI,
  functionName: 'balanceOf',
  args: address ? [address] : undefined,
  query: { enabled: !token.isNative && !!address },
})
```

#### New Broken Implementation (`src/components/dex/TokenInputField.tsx`)
```typescript
// BROKEN: Hardcoded balance
<span className="text-sm text-white/50">Balance: 0.00</span> // Always shows 0.00

// MAX button does nothing useful
onClick={() => onChange('0')} // Sets to 0, not actual balance
```

#### Required Fix
- [ ] Add `useBalance` and `useReadContract` hooks
- [ ] Display actual token balance
- [ ] Fix MAX button to set actual balance value
- [ ] Add balance loading state (Shimmer component)

---

### 3. Transaction Status Modal (CRITICAL)

#### Old Working Implementation
```typescript
// Shows transaction progress
<TxStatusModal
  isOpen={showTxModal}
  status={getTxStatus()} // 'pending' | 'success' | 'error'
  txHash={txHash}
  chainId={chainId}
  title={status === 'approving' ? 'Approving Token' : 'Swapping Tokens'}
  message={/* Success/error message */}
/>
```

#### New Implementation
```typescript
// MISSING: No transaction feedback at all
// User clicks swap, sees spinner, then nothing
```

#### Required Fix
- [ ] Import and integrate `TxStatusModal` component
- [ ] Track transaction hash from `executeSwap` result
- [ ] Show appropriate status messages
- [ ] Link to explorer on success (using chainId-aware URL)

---

### 4. Network Awareness (BROKEN)

#### Old Working Implementation
```typescript
// Dynamic network detection
const chainId = useChainId()
const isDemoMode = !hasDexSupport(chainId)
const isMainnet = chainId === CHAIN_IDS.MAINNET

// Shows correct badges
{isMainnet && <span>Live</span>}
{isDemoMode && <span>Demo</span>}

// Mainnet warning
{isMainnet && isConnected && (
  <div>You're on mainnet. Swaps use real tokens.</div>
)}
```

#### New Implementation (Header.tsx)
```typescript
// BROKEN: Hardcoded network display
<span className="text-emerald-400 text-xs font-medium">0G Testnet</span>
// Always shows "0G Testnet" even on mainnet!
```

#### Required Fix
- [ ] Use `useChainId()` to get actual network
- [ ] Import and use `hasDexSupport`, `CHAIN_IDS` from chains config
- [ ] Show "Mainnet" vs "Testnet" dynamically
- [ ] Use correct explorer links per network

---

### 5. Explorer Link Integration (BROKEN)

#### Old Working Implementation
```typescript
// Network-aware explorer URLs
import { getExplorerUrl } from '@/lib/utils'

href={getExplorerUrl(txHash, 'tx', chainId)}
// Mainnet: https://chainscan.0g.ai/tx/...
// Testnet: https://chainscan-galileo.0g.ai/tx/...
```

#### New Implementation (Footer in App.tsx)
```typescript
// BROKEN: Hardcoded to testnet
<a href="https://chainscan-galileo.0g.ai">Explorer</a>
// Always links to testnet explorer!
```

#### Required Fix
- [ ] Use `getExplorerUrl()` function with chainId
- [ ] Make footer links dynamic based on current network

---

## Template Flexibility Analysis

### Current Problem
The new UI hardcodes all features - not suitable as a template where users may want different feature combinations.

### Required Config-Driven Architecture

#### Proposed Feature Config (`src/config/features.ts`)
```typescript
export interface FeatureConfig {
  // Core features
  swap: {
    enabled: boolean
    showChart: boolean      // Show chart panel next to swap
    showPriceImpact: boolean
    showNetworkFee: boolean
  }

  // Optional panels
  pools: {
    enabled: boolean
    showMyPositions: boolean
    allowCreatePool: boolean
  }

  chart: {
    enabled: boolean
    defaultTimeRange: '1H' | '24H' | '7D' | '30D' | '1Y'
  }

  portfolio: {
    enabled: boolean
    showHoldings: boolean
    showActivity: boolean
  }

  // UI options
  ui: {
    showNetworkBadge: boolean
    showFaucetLink: boolean
    animatedBackground: boolean
  }
}

// Default config (full features)
export const DEFAULT_FEATURES: FeatureConfig = {
  swap: { enabled: true, showChart: true, showPriceImpact: true, showNetworkFee: true },
  pools: { enabled: true, showMyPositions: true, allowCreatePool: true },
  chart: { enabled: true, defaultTimeRange: '24H' },
  portfolio: { enabled: true, showHoldings: true, showActivity: true },
  ui: { showNetworkBadge: true, showFaucetLink: true, animatedBackground: true },
}

// Minimal config (swap only)
export const MINIMAL_FEATURES: FeatureConfig = {
  swap: { enabled: true, showChart: false, showPriceImpact: true, showNetworkFee: false },
  pools: { enabled: false, showMyPositions: false, allowCreatePool: false },
  chart: { enabled: false, defaultTimeRange: '24H' },
  portfolio: { enabled: false, showHoldings: false, showActivity: false },
  ui: { showNetworkBadge: true, showFaucetLink: true, animatedBackground: true },
}
```

#### Feature Provider Pattern
```typescript
// src/providers/feature-provider.tsx
import { createContext, useContext } from 'react'
import { DEFAULT_FEATURES, type FeatureConfig } from '@/config/features'

const FeatureContext = createContext<FeatureConfig>(DEFAULT_FEATURES)

export function FeatureProvider({
  config = DEFAULT_FEATURES,
  children
}: {
  config?: Partial<FeatureConfig>
  children: React.ReactNode
}) {
  const mergedConfig = { ...DEFAULT_FEATURES, ...config }
  return (
    <FeatureContext.Provider value={mergedConfig}>
      {children}
    </FeatureContext.Provider>
  )
}

export function useFeatures() {
  return useContext(FeatureContext)
}
```

#### Usage in Components
```typescript
// In Header.tsx - conditional tabs
const { pools, chart, portfolio } = useFeatures()

const tabs = [
  { id: 'swap', label: 'Swap', icon: <ArrowLeftRight /> },
  pools.enabled && { id: 'pools', label: 'Pools', icon: <LayoutGrid /> },
  chart.enabled && { id: 'chart', label: 'Chart', icon: <LineChart /> },
  portfolio.enabled && { id: 'portfolio', label: 'Portfolio', icon: <Wallet /> },
].filter(Boolean)
```

---

## Implementation Tasks

### Phase 1: Component Restructuring (Do First)

> **Why first?** Consolidating structure before fixing components avoids duplicate work and ensures consistent file paths.

| ID | Task | Priority | Effort | Description |
|----|------|----------|--------|-------------|
| 1.1 | Migrate `dex/SwapPanel.tsx` → `web3/swap-panel.tsx` | P0 | Low | Move + rename to kebab-case |
| 1.2 | Merge `dex/TokenInputField.tsx` → `web3/token-input.tsx` | P0 | Medium | Combine new UI with old balance logic |
| 1.3 | Compare & merge `dex/TokenSelectModal.tsx` → `web3/token-select-modal.tsx` | P0 | Low | Keep better version |
| 1.4 | Compare & merge `dex/SwapSettings.tsx` → `web3/swap-settings.tsx` | P0 | Low | New has inline design |
| 1.5 | Migrate `dex/ChartPanel.tsx` → `web3/chart-panel.tsx` | P0 | Low | Move + rename |
| 1.6 | Migrate `dex/PoolsPanel.tsx` → `web3/pools-panel.tsx` | P0 | Low | Move + rename |
| 1.7 | Migrate `dex/PortfolioPanel.tsx` → `web3/portfolio-panel.tsx` | P0 | Low | Move + rename |
| 1.8 | Migrate `layout/Header.tsx` → `web3/header.tsx` | P0 | Low | Move + rename |
| 1.9 | Delete empty `dex/` and `layout/` directories | P0 | Low | Clean up |
| 1.10 | Update all imports in `App.tsx` | P0 | Low | Point to new paths |
| 1.11 | Create/update `web3/index.ts` barrel export | P0 | Low | Export all components |
| 1.12 | Deprecate `web3/swap-card.tsx` | P0 | Low | Add deprecation comment, keep for reference |

### Phase 2: Critical Fixes (Restore Working Functionality)

| ID | Task | Priority | Effort | Files (after restructure) |
|----|------|----------|--------|---------------------------|
| 2.1 | Integrate `useSwap` hook into swap-panel | P0 | Medium | `src/components/web3/swap-panel.tsx` |
| 2.2 | Replace mock quote with `getQuote()` | P0 | Low | `src/components/web3/swap-panel.tsx` |
| 2.3 | Replace fake swap with `executeSwap()` | P0 | Medium | `src/components/web3/swap-panel.tsx` |
| 2.4 | Add `TxStatusModal` integration | P0 | Medium | `src/components/web3/swap-panel.tsx` |
| 2.5 | Add approval state handling | P0 | Low | `src/components/web3/swap-panel.tsx` |
| 2.6 | Fix token balance fetching in token-input | P0 | Medium | `src/components/web3/token-input.tsx` |
| 2.7 | Fix MAX button functionality | P0 | Low | `src/components/web3/token-input.tsx` |
| 2.8 | Fix network display in header | P0 | Low | `src/components/web3/header.tsx` |
| 2.9 | Fix explorer links (footer, tx modal) | P0 | Low | `src/App.tsx`, various |

### Phase 3: Template Architecture

| ID | Task | Priority | Effort | Files |
|----|------|----------|--------|-------|
| 3.1 | Create feature config system | P1 | Medium | `src/config/features.ts` (new) |
| 3.2 | Create FeatureProvider | P1 | Medium | `src/providers/feature-provider.tsx` (new) |
| 3.3 | Make header tabs config-driven | P1 | Low | `src/components/web3/header.tsx` |
| 3.4 | Make App panels config-driven | P1 | Low | `src/App.tsx` |
| 3.5 | Make swap-panel features config-driven | P1 | Medium | `src/components/web3/swap-panel.tsx` |
| 3.6 | Update `.bolt/prompt` with component docs | P1 | Low | `.bolt/prompt` |

### Phase 4: Config Extensions (New Panels)

| ID | Task | Priority | Effort | Files |
|----|------|----------|--------|-------|
| 4.1 | Create pools config (`src/constants/pools.ts`) | P2 | Medium | New file |
| 4.2 | Extend chain metadata for feature flags | P2 | Low | `src/config/chains.ts` |
| 4.3 | Add Position Manager ABI | P2 | Low | `src/constants/abis.ts` |
| 4.4 | Create `usePools` hook | P2 | High | `src/hooks/usePools.ts` (new) |
| 4.5 | Create `usePortfolio` hook | P2 | High | `src/hooks/usePortfolio.ts` (new) |
| 4.6 | Integrate real data into pools-panel | P2 | Medium | `src/components/web3/pools-panel.tsx` |
| 4.7 | Integrate real balances into portfolio-panel | P2 | Medium | `src/components/web3/portfolio-panel.tsx` |
| 4.8 | Add "Demo Data" label to chart-panel | P2 | Low | `src/components/web3/chart-panel.tsx` |

### Phase 5: Polish & Testing

| ID | Task | Priority | Effort | Description |
|----|------|----------|--------|-------------|
| 5.1 | Test swap flow on mainnet | P1 | Medium | Manual testing |
| 5.2 | Test swap flow on testnet (demo mode) | P1 | Low | Manual testing |
| 5.3 | Test all feature config combinations | P2 | Medium | Manual testing |
| 5.4 | Verify build passes | P1 | Low | `npm run build` |
| 5.5 | Update documentation | P2 | Low | `docs/`, `.bolt/prompt` |
| 5.6 | Verify WebContainer compatibility | P1 | Medium | Test in 0G-Vibe |

### Implementation Order Summary

```
Phase 1: Restructure     ──→  Phase 2: Fix Broken    ──→  Phase 3: Config System
(move files first)            (now in correct paths)       (template flexibility)
                                      │
                                      ↓
                              Phase 4: New Panel Configs  ──→  Phase 5: Testing
                              (pools, portfolio data)          (verify everything)
```

---

## File-by-File Changes Required

> **Note**: All file paths below reflect the target structure AFTER Phase 1 restructuring.

### `src/components/web3/swap-panel.tsx` (formerly `dex/SwapPanel.tsx`)

```typescript
// ADD these imports
import { useSwap } from '@/hooks/useSwap'
import { TxStatusModal } from '@/components/web3/tx-status-modal'
import { CHAIN_IDS } from '@/config/chains'

// ADD state for tx modal
const [showTxModal, setShowTxModal] = useState(false)

// REPLACE mock exchange rate with real hook
const { status, error, txHash, getQuote, executeSwap, reset } = useSwap()

// REPLACE mock quote calculation
const handleFromAmountChange = useCallback(async (value: string) => {
  setFromAmount(value)
  if (!value || parseFloat(value) <= 0) {
    setToAmount('')
    return
  }
  const quote = await getQuote({ tokenIn: fromToken, tokenOut: toToken, amountIn: value })
  if (quote) {
    setToAmount(quote.amountOut)
    setExchangeRate(quote.rate)
    setPriceImpact(quote.priceImpact)
  }
}, [fromToken, toToken, getQuote])

// REPLACE fake handleSwap
const handleSwap = async () => {
  if (!fromAmount || parseFloat(fromAmount) <= 0) return
  setShowTxModal(true)
  const result = await executeSwap({
    tokenIn: fromToken,
    tokenOut: toToken,
    amountIn: fromAmount,
    slippagePercent: slippage,
    deadlineMinutes: 20,
  })
  if (result) {
    setFromAmount('')
    setToAmount('')
  }
}

// ADD TxStatusModal component
<TxStatusModal
  isOpen={showTxModal}
  onClose={() => { setShowTxModal(false); reset() }}
  status={status === 'approving' || status === 'swapping' ? 'pending' : status}
  txHash={txHash || undefined}
  chainId={chainId}
  title={status === 'approving' ? 'Approving Token' : 'Swapping Tokens'}
/>
```

### `src/components/web3/token-input.tsx` (merged from `dex/TokenInputField.tsx` + old `web3/token-input.tsx`)

```typescript
// ADD these imports (take balance logic from old token-input.tsx)
import { useAccount, useBalance, useReadContract } from 'wagmi'
import { ERC20_ABI } from '@/constants/abis'
import { formatBalance } from '@/lib/utils'
import { Shimmer } from '@/components/ui/shimmer'

// ADD props
interface TokenInputFieldProps {
  // ... existing
  showBalance?: boolean // Add this
}

// ADD balance fetching inside component
const { address } = useAccount()

const { data: nativeBalance, isLoading: nativeLoading } = useBalance({
  address,
  query: { enabled: token.isNative && !!address },
})

const { data: erc20Balance, isLoading: erc20Loading } = useReadContract({
  address: token.address as `0x${string}`,
  abi: ERC20_ABI,
  functionName: 'balanceOf',
  args: address ? [address] : undefined,
  query: { enabled: !token.isNative && !!address && token.address !== 'native' },
})

const isLoadingBalance = token.isNative ? nativeLoading : erc20Loading
const balance = token.isNative
  ? nativeBalance ? formatBalance(nativeBalance.value, nativeBalance.decimals) : '0'
  : erc20Balance ? formatBalance(erc20Balance as bigint, token.decimals) : '0'

// FIX balance display
{showMax && (
  <div className="flex items-center gap-2">
    {isLoadingBalance ? (
      <Shimmer width={60} height={16} rounded="sm" />
    ) : (
      <span className="text-sm text-white/50">Balance: {balance}</span>
    )}
    <button onClick={() => onChange(balance)} /* FIX: use actual balance */>
      MAX
    </button>
  </div>
)}
```

### `src/components/web3/header.tsx` (formerly `layout/Header.tsx`)

```typescript
// ADD imports
import { useChainId } from 'wagmi'
import { hasDexSupport, CHAIN_IDS, getChainMetadata } from '@/config/chains'

// ADD in component
const chainId = useChainId()
const { name: networkName } = getChainMetadata(chainId)
const isMainnet = chainId === CHAIN_IDS.MAINNET

// FIX network indicator
{isConnected && (
  <div className={cn(
    "flex items-center gap-2 px-3 py-1.5 rounded-lg border",
    isMainnet
      ? "bg-amber-500/10 border-amber-500/20"
      : "bg-emerald-500/10 border-emerald-500/20"
  )}>
    <span className={cn(
      "text-xs font-medium",
      isMainnet ? "text-amber-400" : "text-emerald-400"
    )}>
      {isMainnet ? '0G Mainnet' : '0G Testnet'}
    </span>
  </div>
)}
```

### `src/App.tsx`

```typescript
// UPDATE imports after restructuring
import { SwapPanel } from '@/components/web3/swap-panel'
import { PoolsPanel } from '@/components/web3/pools-panel'
import { ChartPanel } from '@/components/web3/chart-panel'
import { PortfolioPanel } from '@/components/web3/portfolio-panel'
import { Header } from '@/components/web3/header'

// FIX footer explorer link
import { useChainId } from 'wagmi'
import { getChainMetadata } from '@/config/chains'

// In component
const chainId = useChainId()
const { explorerUrl, faucetUrl } = getChainMetadata(chainId)

// In footer
<a href={explorerUrl}>Explorer</a>
<a href={faucetUrl}>Faucet</a>
```

---

## Decision Points

### 1. Component Organization (DECIDED)

**Question**: Should we keep both `src/components/web3/` and `src/components/dex/` or merge them?

**Decision**: **Merge into `web3/`** - Use `web3/` + `ui/` structure with naming conventions.

**Rationale** (Template-specific considerations):

| Criteria | `web3/` + `ui/` | `dex/` + `layout/` + `web3/` |
|----------|-----------------|------------------------------|
| LLM discoverability | ✅ Simple - "web3 components" is intuitive | ⚠️ More folders to search |
| Adding new features | ✅ Just add to `web3/` | ❓ Where does NFT gallery go? New folder? |
| Import clarity | ✅ `@/components/web3/swap-panel` | ⚠️ Mixed imports from different folders |
| Documentation | ✅ Easy to list in `.bolt/prompt` | ⚠️ More structure to explain |
| Template flexibility | ✅ Flat structure, easy to modify | ⚠️ Domain-specific folders limit flexibility |

**Why simpler is better for templates**:
1. **LLM-friendly**: When user says "add a staking panel", LLM knows to create `web3/staking-panel.tsx`
2. **Naming convention over folders**: `-panel` suffix distinguishes composed features from primitives
3. **Easier `.bolt/prompt`**: Simple to document component categories
4. **Flexible for future**: NFT gallery → `web3/nft-gallery-panel.tsx`, Bridge → `web3/bridge-panel.tsx`

#### Target Structure

```
src/components/
├── ui/                         # Design system (not Web3 specific)
│   ├── glass-card.tsx
│   ├── glass-button.tsx
│   ├── glass-input.tsx
│   ├── shimmer.tsx
│   ├── number-flow.tsx
│   ├── gradient-text.tsx
│   └── animated-background.tsx
│
└── web3/                       # ALL Web3 components (flat with naming convention)
    │
    │ # ─── Primitives (reusable building blocks) ───
    ├── token-icon.tsx
    ├── token-balance.tsx
    ├── token-balance-list.tsx
    ├── token-input.tsx              # With real balance fetching
    ├── token-select-modal.tsx
    ├── connect-button.tsx
    ├── account-info.tsx
    ├── network-badge.tsx
    ├── explorer-link.tsx
    ├── tx-status-modal.tsx
    ├── swap-settings.tsx
    │
    │ # ─── Feature Panels (suffix: -panel) ───
    ├── swap-panel.tsx               # Main swap interface
    ├── pools-panel.tsx              # Liquidity pools
    ├── chart-panel.tsx              # Price chart
    ├── portfolio-panel.tsx          # Holdings & activity
    │
    │ # ─── Layout Components ───
    └── header.tsx                   # App header with tabs
```

#### Naming Conventions

| Type | Convention | Examples |
|------|------------|----------|
| Primitives | kebab-case, descriptive | `token-icon.tsx`, `tx-status-modal.tsx` |
| Feature Panels | `-panel` suffix | `swap-panel.tsx`, `pools-panel.tsx` |
| Layout | descriptive name | `header.tsx`, `footer.tsx` |

#### Migration Steps

```bash
# 1. Move dex/ components to web3/ with renamed files
mv src/components/dex/SwapPanel.tsx      src/components/web3/swap-panel.tsx
mv src/components/dex/TokenInputField.tsx src/components/web3/token-input.tsx  # Merge with existing
mv src/components/dex/TokenSelectModal.tsx src/components/web3/token-select-modal.tsx  # Compare/merge
mv src/components/dex/SwapSettings.tsx    src/components/web3/swap-settings.tsx  # Compare/merge
mv src/components/dex/ChartPanel.tsx      src/components/web3/chart-panel.tsx
mv src/components/dex/PoolsPanel.tsx      src/components/web3/pools-panel.tsx
mv src/components/dex/PortfolioPanel.tsx  src/components/web3/portfolio-panel.tsx

# 2. Move layout/ to web3/
mv src/components/layout/Header.tsx       src/components/web3/header.tsx

# 3. Delete empty directories
rm -rf src/components/dex/
rm -rf src/components/layout/

# 4. Update all imports throughout codebase
# - @/components/dex/SwapPanel → @/components/web3/swap-panel
# - @/components/layout/Header → @/components/web3/header
```

#### Import Pattern After Migration

```typescript
// In App.tsx
import { SwapPanel } from '@/components/web3/swap-panel'
import { PoolsPanel } from '@/components/web3/pools-panel'
import { ChartPanel } from '@/components/web3/chart-panel'
import { PortfolioPanel } from '@/components/web3/portfolio-panel'
import { Header } from '@/components/web3/header'

// All web3 components from one place
import {
  TokenIcon,
  TokenBalance,
  ConnectButton,
  NetworkBadge,
  TxStatusModal,
} from '@/components/web3'
```

#### .bolt/prompt Documentation

```markdown
PRE-BUILT COMPONENTS:

UI Components (src/components/ui/):
- GlassCard, GlassButton, GlassInput - Glassmorphism design system
- Shimmer - Loading skeleton
- AnimatedBackground - Gradient mesh background
- GradientText, NumberFlow - Text effects

Web3 Components (src/components/web3/):
- Primitives: TokenIcon, TokenBalance, TokenInput, ConnectButton, NetworkBadge, ExplorerLink, TxStatusModal
- Panels: SwapPanel, PoolsPanel, ChartPanel, PortfolioPanel (suffix: -panel)
- Layout: Header

To add new features:
- New panel → create web3/[feature]-panel.tsx
- New primitive → create web3/[name].tsx
```

### 2. Feature Toggle Granularity
**Question**: How granular should feature toggles be?

**Options**:
- **A) Panel-level only**: Just enable/disable Swap, Pools, Chart, Portfolio
- **B) Feature-level**: Also toggle sub-features (price impact, network fee, etc.)
- **C) Full granularity**: Every UI element configurable

**Recommendation**: Option B - Panel-level + key sub-features. Enough flexibility without over-engineering.

---

## Success Criteria

### Structure
- [ ] All components consolidated into `web3/` + `ui/` structure
- [ ] `dex/` and `layout/` directories removed
- [ ] Naming convention applied (`-panel` suffix for feature panels)
- [ ] Barrel exports in `web3/index.ts`

### Functionality
- [ ] Swap executes real V3 transactions on mainnet
- [ ] Swap shows demo mode on testnet
- [ ] Token balances display correctly
- [ ] MAX button fills actual balance
- [ ] Transaction status modal shows progress
- [ ] Explorer links use correct network
- [ ] Network badge shows actual network

### Template Architecture
- [ ] Features can be toggled via config
- [ ] `.bolt/prompt` documents all components with naming conventions
- [ ] LLM can easily add new panels (e.g., `web3/staking-panel.tsx`)

### Quality
- [ ] Build passes without errors
- [ ] Works in WebContainer (0G-Vibe)
- [ ] Deploys to Vercel successfully

---

## Appendix: Component Inventory

### Current State → Target State Migration

#### Components to KEEP in `web3/` (Primitives)

| Current File | Target File | Status | Action |
|--------------|-------------|--------|--------|
| `web3/token-icon.tsx` | `web3/token-icon.tsx` | ✅ Working | Keep as-is |
| `web3/token-balance.tsx` | `web3/token-balance.tsx` | ✅ Working | Keep as-is |
| `web3/token-balance-list.tsx` | `web3/token-balance-list.tsx` | ✅ Working | Keep as-is |
| `web3/connect-button.tsx` | `web3/connect-button.tsx` | ✅ Working | Keep as-is |
| `web3/account-info.tsx` | `web3/account-info.tsx` | ✅ Working | Keep as-is |
| `web3/network-badge.tsx` | `web3/network-badge.tsx` | ✅ Working | Keep as-is |
| `web3/explorer-link.tsx` | `web3/explorer-link.tsx` | ✅ Working | Keep as-is |
| `web3/tx-status-modal.tsx` | `web3/tx-status-modal.tsx` | ✅ Working | Keep as-is |

#### Components to MIGRATE from `dex/` → `web3/`

| Current File | Target File | Status | Action |
|--------------|-------------|--------|--------|
| `dex/SwapPanel.tsx` | `web3/swap-panel.tsx` | ❌ Broken | Move + Fix with `useSwap` hook |
| `dex/TokenInputField.tsx` | `web3/token-input.tsx` | ❌ Broken | **Merge** with existing `token-input.tsx` (use new UI + old balance logic) |
| `dex/TokenSelectModal.tsx` | `web3/token-select-modal.tsx` | ✅ Working | **Compare/merge** with existing (keep better version) |
| `dex/SwapSettings.tsx` | `web3/swap-settings.tsx` | ✅ Working | **Compare/merge** with existing (new has inline design) |
| `dex/ChartPanel.tsx` | `web3/chart-panel.tsx` | ⚠️ Mock data | Move + Add "Demo" label |
| `dex/PoolsPanel.tsx` | `web3/pools-panel.tsx` | ⚠️ Mock data | Move + Add config integration |
| `dex/PortfolioPanel.tsx` | `web3/portfolio-panel.tsx` | ⚠️ Mock data | Move + Add real balance fetching |

#### Components to MIGRATE from `layout/` → `web3/`

| Current File | Target File | Status | Action |
|--------------|-------------|--------|--------|
| `layout/Header.tsx` | `web3/header.tsx` | ❌ Broken | Move + Fix network display |

#### Components to DEPRECATE (after migration)

| File | Reason |
|------|--------|
| `web3/swap-card.tsx` | Replaced by new `swap-panel.tsx` (better UI) |
| `dex/` directory | Merged into `web3/` |
| `layout/` directory | Merged into `web3/` |

### Target `web3/` Directory (After Migration)

```
src/components/web3/
├── # Primitives (reusable)
├── token-icon.tsx           ✅ Existing
├── token-balance.tsx        ✅ Existing
├── token-balance-list.tsx   ✅ Existing
├── token-input.tsx          🔀 Merged (new UI + old balance logic)
├── token-select-modal.tsx   🔀 Merged (compare both versions)
├── connect-button.tsx       ✅ Existing
├── account-info.tsx         ✅ Existing
├── network-badge.tsx        ✅ Existing
├── explorer-link.tsx        ✅ Existing
├── tx-status-modal.tsx      ✅ Existing
├── swap-settings.tsx        🔀 Merged (new inline design)
│
├── # Feature Panels (-panel suffix)
├── swap-panel.tsx           📦 From dex/ + fixes
├── pools-panel.tsx          📦 From dex/ + config
├── chart-panel.tsx          📦 From dex/ + demo label
├── portfolio-panel.tsx      📦 From dex/ + real data
│
└── # Layout
└── header.tsx               📦 From layout/ + fixes
```

Legend: ✅ Keep | 🔀 Merge | 📦 Migrate | ❌ Fix required

---

## Configuration Layer Analysis (NEW PANELS)

This section documents the missing configuration requirements for the new panels (Pools, Chart, Portfolio) to integrate with the existing config-driven architecture.

### Existing Config Architecture

The template already has a solid config foundation:

| File | Purpose | Current State |
|------|---------|---------------|
| `src/config/chains.ts` | Chain definitions, `hasDexSupport()`, `getChainMetadata()` | ✅ Working |
| `src/constants/contracts.ts` | Router, Factory, Wrapped Native addresses | ✅ Working (Swap only) |
| `src/constants/tokens.ts` | Token lists by chain, `getTokens()`, `getDefaultTokenPair()` | ✅ Working |
| `src/constants/abis.ts` | ERC20, Router, Factory, Pool ABIs | ✅ Working (Swap only) |

**Problem**: New panels (Pools, Portfolio) need additional config that doesn't exist yet.

---

### Pool Contracts Config

#### Current State (`src/constants/contracts.ts`)

```typescript
// Existing - only has one known pool
export const POOLS = {
  [CHAIN_IDS.MAINNET]: {
    'W0G_USDC_3000': '0xa9e824eddb9677fb2189ab9c439238a83696c091' as const,
  },
  [CHAIN_IDS.TESTNET]: {},
}
```

#### Required Additions

The PoolsPanel needs:
1. **Pool discovery** - Query Factory for all pools, or define known pools
2. **Pool metadata** - TVL, APR, volume (requires indexer/API or on-chain calculation)
3. **User positions** - Query user's LP token balances (NFT positions for V3)

```typescript
// PROPOSED: src/constants/pools.ts

import { CHAIN_IDS } from '@/config/chains'
import type { Token } from './tokens'

export interface PoolConfig {
  id: string
  address: `0x${string}`
  token0: Token
  token1: Token
  fee: number // e.g., 3000 = 0.3%
  // Optional metadata (if available from indexer)
  name?: string
  description?: string
}

// Known pools by chain (manual config for known pools)
export const KNOWN_POOLS: Record<number, PoolConfig[]> = {
  [CHAIN_IDS.MAINNET]: [
    {
      id: 'w0g-usdc-3000',
      address: '0xa9e824eddb9677fb2189ab9c439238a83696c091',
      token0: /* W0G token */,
      token1: /* USDC.e token */,
      fee: 3000,
      name: 'W0G/USDC.e',
      description: 'Main liquidity pool for W0G',
    },
    // Add more known pools as discovered
  ],
  [CHAIN_IDS.TESTNET]: [],
}

// Helper to get pools for a chain
export function getPools(chainId: number): PoolConfig[] {
  return KNOWN_POOLS[chainId] || []
}

// Helper to check if pools feature is available
export function hasPoolsSupport(chainId: number): boolean {
  return KNOWN_POOLS[chainId]?.length > 0
}
```

#### Pool ABIs Required

The existing `POOL_ABI` in `abis.ts` is minimal. For full PoolsPanel functionality, add:

```typescript
// PROPOSED additions to src/constants/abis.ts

// Extended Pool ABI for position management
export const POOL_EXTENDED_ABI = [
  ...POOL_ABI, // Existing: slot0, token0, token1, fee, liquidity

  // Additional for pool stats
  {
    name: 'tickSpacing',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'int24' }],
  },
  {
    name: 'maxLiquidityPerTick',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint128' }],
  },
  // Events for volume tracking (if listening to events)
  {
    anonymous: false,
    name: 'Swap',
    type: 'event',
    inputs: [
      { indexed: true, name: 'sender', type: 'address' },
      { indexed: true, name: 'recipient', type: 'address' },
      { indexed: false, name: 'amount0', type: 'int256' },
      { indexed: false, name: 'amount1', type: 'int256' },
      { indexed: false, name: 'sqrtPriceX96', type: 'uint160' },
      { indexed: false, name: 'liquidity', type: 'uint128' },
      { indexed: false, name: 'tick', type: 'int24' },
    ],
  },
] as const

// Uniswap V3 NonfungiblePositionManager ABI (for LP positions)
// Note: Only needed if Janie DEX uses NFT positions like Uniswap V3
export const POSITION_MANAGER_ABI = [
  {
    name: 'positions',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [
      { name: 'nonce', type: 'uint96' },
      { name: 'operator', type: 'address' },
      { name: 'token0', type: 'address' },
      { name: 'token1', type: 'address' },
      { name: 'fee', type: 'uint24' },
      { name: 'tickLower', type: 'int24' },
      { name: 'tickUpper', type: 'int24' },
      { name: 'liquidity', type: 'uint128' },
      { name: 'feeGrowthInside0LastX128', type: 'uint256' },
      { name: 'feeGrowthInside1LastX128', type: 'uint256' },
      { name: 'tokensOwed0', type: 'uint128' },
      { name: 'tokensOwed1', type: 'uint128' },
    ],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'tokenOfOwnerByIndex',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'index', type: 'uint256' },
    ],
    outputs: [{ type: 'uint256' }],
  },
] as const
```

#### Contract Addresses Needed

```typescript
// PROPOSED additions to src/constants/contracts.ts

export const CONTRACTS = {
  [CHAIN_IDS.MAINNET]: {
    // Existing
    ROUTER: '0x8b598a7c136215a95ba0282b4d832b9f9801f2e2' as const,
    FACTORY: '0x9bdca5798e52e592a08e3b34d3f18eef76af7ef4' as const,
    WRAPPED_NATIVE: '0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c' as const,

    // NEW: Required for PoolsPanel
    POSITION_MANAGER: null as const, // TODO: Find Janie's NFT position manager address
    QUOTER: null as const,           // TODO: Find Janie's quoter address (for precise quotes)
  },
  [CHAIN_IDS.TESTNET]: {
    ROUTER: null,
    FACTORY: null,
    WRAPPED_NATIVE: null,
    POSITION_MANAGER: null,
    QUOTER: null,
  },
}
```

---

### Token Config for Pools/Portfolio

#### Current State

Tokens are defined in `src/constants/tokens.ts` with basic properties:

```typescript
interface Token {
  address: `0x${string}` | 'native'
  symbol: string
  name: string
  decimals: number
  logoURI: string
  isNative?: boolean
}
```

#### Required Extensions

For Portfolio/Pools panels to work properly:

```typescript
// PROPOSED: Extended Token interface

export interface Token {
  // Existing
  address: `0x${string}` | 'native'
  symbol: string
  name: string
  decimals: number
  logoURI: string
  isNative?: boolean

  // NEW: For portfolio display
  coingeckoId?: string        // For price fetching (if using CoinGecko)
  priceSource?: 'pool' | 'api' | 'none'  // How to get price

  // NEW: For pool displays
  color?: string              // Brand color for charts/UI (e.g., '#8B5CF6')
}

// PROPOSED: Price config for tokens
export interface TokenPriceConfig {
  // Primary: Get price from pool against stable
  poolPair?: {
    stableToken: `0x${string}`  // e.g., USDC.e address
    poolAddress: `0x${string}`
    fee: number
  }
  // Fallback: API source
  apiSource?: 'coingecko' | 'none'
  apiId?: string
}

export const TOKEN_PRICE_CONFIG: Record<string, TokenPriceConfig> = {
  '0G': {
    poolPair: {
      stableToken: '0x1f3aa82227281ca364bfb3d253b0f1af1da6473e', // USDC.e
      poolAddress: '0xa9e824eddb9677fb2189ab9c439238a83696c091',
      fee: 3000,
    },
  },
  'W0G': {
    poolPair: {
      stableToken: '0x1f3aa82227281ca364bfb3d253b0f1af1da6473e',
      poolAddress: '0xa9e824eddb9677fb2189ab9c439238a83696c091',
      fee: 3000,
    },
  },
  'USDC.e': {
    // Stablecoins are 1:1 USD
    apiSource: 'none',
  },
}
```

---

### Chain Config for New Components

#### Current State (`src/config/chains.ts`)

```typescript
export const getChainMetadata = (chainId: number) => {
  return {
    id, name, nativeCurrency, faucetUrl, explorerUrl, rpcUrl, hasDex,
  }
}
```

#### Required Extensions

```typescript
// PROPOSED: Extended chain metadata

export const getChainMetadata = (chainId: number) => {
  const chain = chainId === CHAIN_IDS.MAINNET ? zgMainnet : zgTestnet
  return {
    // Existing
    id: chain.id,
    name: chain.name,
    nativeCurrency: chain.nativeCurrency,
    faucetUrl: chainId === CHAIN_IDS.TESTNET ? 'https://faucet.0g.ai' : 'https://hub.0g.ai/bridge',
    explorerUrl: chain.blockExplorers.default.url,
    rpcUrl: chain.rpcUrls.default.http[0],
    hasDex: hasDexSupport(chainId),

    // NEW: For feature toggles
    hasPools: hasPoolsSupport(chainId),        // Are there pools to display?
    hasPortfolio: true,                         // Portfolio always available (shows balances)
    hasChart: hasDexSupport(chainId),          // Chart needs price data from pools

    // NEW: For UI
    displayName: chainId === CHAIN_IDS.MAINNET ? '0G Mainnet' : '0G Testnet',
    isTestnet: chain.testnet,
    brandColor: '#8B5CF6',                     // For network badge theming

    // NEW: For explorer links
    explorerName: '0G Explorer',
    txPath: '/tx/',                            // Explorer path pattern for transactions
    addressPath: '/address/',                  // Explorer path pattern for addresses

    // NEW: For subgraph/indexer (if available)
    subgraphUrl: chainId === CHAIN_IDS.MAINNET
      ? null  // TODO: Add subgraph URL when available
      : null,
    indexerUrl: chainId === CHAIN_IDS.MAINNET
      ? null  // TODO: Add indexer URL when available
      : null,
  }
}
```

---

### New Panel Integration Strategy

#### PoolsPanel Integration

| Current | Required | How to Fix |
|---------|----------|------------|
| Uses `MOCK_POOLS` array | Use real pool data | Create `usePools` hook that queries Factory or uses known pools config |
| Hardcoded TVL/APR/Volume | Fetch from chain or indexer | Either query pool contracts for liquidity, or integrate with indexer API |
| No user position tracking | Track LP positions | Query PositionManager NFTs for user's address |

**Proposed Hook: `usePools.ts`**

```typescript
// src/hooks/usePools.ts
export function usePools() {
  const chainId = useChainId()
  const publicClient = usePublicClient()
  const { address } = useAccount()

  // Get known pools for chain
  const pools = getPools(chainId)

  // Fetch pool state (liquidity, price) from contracts
  const poolStates = useQueries(
    pools.map(pool => ({
      queryKey: ['pool', pool.address],
      queryFn: () => fetchPoolState(publicClient, pool.address),
      enabled: !!publicClient,
    }))
  )

  // Fetch user positions (if connected)
  const userPositions = useQuery({
    queryKey: ['positions', address, chainId],
    queryFn: () => fetchUserPositions(publicClient, address, chainId),
    enabled: !!publicClient && !!address,
  })

  return {
    pools: poolStates.map((q, i) => ({ ...pools[i], ...q.data })),
    userPositions: userPositions.data,
    isLoading: poolStates.some(q => q.isLoading),
  }
}
```

#### PortfolioPanel Integration

| Current | Required | How to Fix |
|---------|----------|------------|
| Uses `MOCK_HOLDINGS` | Fetch real token balances | Use existing `useBalance`/`useReadContract` patterns from `token-input.tsx` |
| Uses `MOCK_TRANSACTIONS` | Fetch from explorer API | Query explorer API for address history |
| Hardcoded prices | Calculate from pools | Use pool price queries similar to `useSwap.getQuote()` |

**Proposed Hook: `usePortfolio.ts`**

```typescript
// src/hooks/usePortfolio.ts
export function usePortfolio() {
  const { address } = useAccount()
  const chainId = useChainId()
  const tokens = getTokens(chainId)

  // Fetch all token balances
  const balances = useQueries(
    tokens.map(token => ({
      queryKey: ['balance', token.address, address],
      queryFn: () => fetchTokenBalance(token, address),
      enabled: !!address,
    }))
  )

  // Fetch token prices from pools
  const prices = useQueries(
    tokens.map(token => ({
      queryKey: ['price', token.symbol, chainId],
      queryFn: () => fetchTokenPrice(token, chainId),
    }))
  )

  // Calculate holdings with USD values
  const holdings = tokens.map((token, i) => ({
    ...token,
    balance: balances[i].data || 0n,
    price: prices[i].data || 0,
    value: calculateValue(balances[i].data, prices[i].data, token.decimals),
  }))

  return {
    holdings: holdings.filter(h => h.balance > 0n),
    totalValue: holdings.reduce((sum, h) => sum + h.value, 0),
    isLoading: balances.some(q => q.isLoading),
  }
}
```

#### ChartPanel Integration

| Current | Required | How to Fix |
|---------|----------|------------|
| Generates mock data | Fetch historical prices | Either from indexer/subgraph, or store in local state |
| No real-time updates | Subscribe to pool events | Use `watchContractEvent` for Swap events |

**Note**: ChartPanel is the hardest to make fully real without an indexer or price API. Options:

1. **Minimal**: Keep mock data, label as "Demo" - acceptable for template
2. **On-chain only**: Query pool slot0 periodically, build local history - limited history
3. **Indexer**: Integrate with 0G subgraph when available - best but requires infrastructure

**Recommended for template**: Option 1 (mock) with clear "Demo Data" label, and structure code to easily plug in real data source later.

---

### Feature Config Integration

Update the proposed `FeatureConfig` to respect chain capabilities:

```typescript
// src/config/features.ts

export interface FeatureConfig {
  swap: {
    enabled: boolean
    // Auto-disabled if chain has no DEX
    requiresDex: true
  }

  pools: {
    enabled: boolean
    // Auto-disabled if chain has no pools
    requiresPools: true
    showMyPositions: boolean
    allowCreatePool: boolean
  }

  chart: {
    enabled: boolean
    // Works in mock mode even without DEX
    requiresDex: false
    showMockDataWarning: boolean
  }

  portfolio: {
    enabled: boolean
    // Always available (shows token balances)
    requiresDex: false
    showHoldings: boolean
    showActivity: boolean
  }
}

// Helper to resolve features based on chain + config
export function resolveFeatures(config: FeatureConfig, chainId: number): FeatureConfig {
  const { hasDex, hasPools } = getChainMetadata(chainId)

  return {
    ...config,
    swap: {
      ...config.swap,
      enabled: config.swap.enabled && (config.swap.requiresDex ? hasDex : true),
    },
    pools: {
      ...config.pools,
      enabled: config.pools.enabled && (config.pools.requiresPools ? hasPools : true),
    },
    // chart and portfolio don't strictly require DEX
  }
}
```

---

### Implementation Priority for Configs

| Priority | Task | Reason |
|----------|------|--------|
| P0 | Fix existing broken components (SwapPanel, TokenInputField, Header) | Restore working functionality |
| P1 | Create `FeatureConfig` system | Enable template flexibility |
| P1 | Add chain feature detection to `getChainMetadata` | Dynamic feature availability |
| P2 | Create `usePools` hook with known pools config | PoolsPanel real data |
| P2 | Create `usePortfolio` hook for token balances | PortfolioPanel real data |
| P3 | Extend token configs with price sources | Portfolio value calculations |
| P3 | Add Position Manager ABI and addresses | LP position tracking |
| P4 | ChartPanel real data integration | Requires indexer |

---

### Config Files Summary

| File | Status | Action Required |
|------|--------|-----------------|
| `src/config/chains.ts` | ✅ Exists | Extend with `hasPools`, `displayName`, `isTestnet` |
| `src/config/features.ts` | ❌ Missing | Create with FeatureConfig and resolveFeatures |
| `src/constants/contracts.ts` | ✅ Exists | Add POSITION_MANAGER, QUOTER addresses |
| `src/constants/tokens.ts` | ✅ Exists | Extend Token interface with price config |
| `src/constants/pools.ts` | ❌ Missing | Create with known pools config |
| `src/constants/abis.ts` | ✅ Exists | Add POOL_EXTENDED_ABI, POSITION_MANAGER_ABI |
| `src/hooks/usePools.ts` | ❌ Missing | Create for PoolsPanel |
| `src/hooks/usePortfolio.ts` | ❌ Missing | Create for PortfolioPanel |
| `src/providers/feature-provider.tsx` | ❌ Missing | Create for config-driven rendering |

---

*End of Analysis*
