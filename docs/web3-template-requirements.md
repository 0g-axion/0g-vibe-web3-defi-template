# Web3 DeFi Starter Template - Requirements & Implementation Plan

> **Version**: 3.0
> **Status**: Approved (Hybrid approach - Demo app + Reusable components)
> **Last Updated**: 2026-01-23

---

## ⚠️ IMPORTANT: Separate Repository Project

**This template will be built as a SEPARATE GitHub repository**, not inside the 0G-Vibe codebase.

```
┌─────────────────────────────────────────────────────────────────┐
│  REPOSITORY STRUCTURE:                                          │
│                                                                 │
│  0G-Vibe App (this repo):                                       │
│    github.com/[org]/0g-vibe                                     │
│    └── Uses templates via GitHub API                            │
│                                                                 │
│  Web3 Template (NEW SEPARATE REPO):                             │
│    github.com/[org]/bolt-web3-defi-template  ← BUILD THIS       │
│    └── Standalone Vite + React project                          │
│                                                                 │
│  Integration:                                                    │
│    0G-Vibe fetches template files from GitHub                   │
│    and loads them into WebContainer                             │
└─────────────────────────────────────────────────────────────────┘
```

**After template repo is created**, update 0G-Vibe's `app/utils/constants.ts` to add the template to `STARTER_TEMPLATES` array.

---

## Executive Summary

Create a **90% complete Web3 DeFi demo app** for 0G-Vibe that provides:
- **Working swap UI out of the box** - Visually impressive, production-ready
- **Pre-built reusable Web3 components** (like shadcn has 47+ UI components)
- **Pre-configured wagmi + RainbowKit** with 0G Galileo chain
- **Glassmorphism design system** with wow-factor animations

**Goal**: User opens template → sees working swap app → gives simple commands to customize → demo complete!

### Template Philosophy (v3 Hybrid)
```
┌─────────────────────────────────────────────────────────────────┐
│  V3 HYBRID APPROACH: Demo App + Reusable Components             │
│                                                                 │
│  Entry Point:    WORKING SWAP UI (not "Start prompting")        │
│  Components:     24+ pre-built, reusable for LLM modifications  │
│  Dependencies:   ALL installed + package-lock.json              │
│  .bolt/prompt:   Guidance for customization                     │
│  User's Task:    Simple commands ("change color", "add NFT")    │
│                                                                 │
│  ✅ 90% complete demo app using the components                  │
│  ✅ Components are modular for easy LLM modifications           │
│  ✅ Visual wow-factor immediately on load                       │
│  ✅ Simple prompts complete the remaining 10%                   │
└─────────────────────────────────────────────────────────────────┘
```

### Demo Flow
```
1. User: "Create a Web3 swap app"
2. Template loads → WORKING swap UI appears immediately
3. User: "Change the accent color to green"
4. LLM: Modifies tailwind.config.js
5. User: "Add my portfolio balance section"
6. LLM: Uses <TokenBalanceList /> component to add section
7. Demo complete! ✨
```

---

## Technical Specifications

### Network Configuration

| Parameter | Value |
|-----------|-------|
| **Network Name** | 0G-Galileo-Testnet |
| **Chain ID** | 16602 |
| **Token Symbol** | 0G (native) |
| **RPC URL** | https://evmrpc-testnet.0g.ai |
| **Block Explorer** | https://chainscan-galileo.0g.ai |
| **Faucet** | https://faucet.0g.ai |

### Chain Definition (viem/wagmi)

```typescript
import { defineChain } from 'viem'

export const zgGalileo = defineChain({
  id: 16602,
  name: '0G-Galileo-Testnet',
  nativeCurrency: {
    decimals: 18,
    name: '0G',
    symbol: '0G',
  },
  rpcUrls: {
    default: { http: ['https://evmrpc-testnet.0g.ai'] },
  },
  blockExplorers: {
    default: {
      name: '0G Explorer',
      url: 'https://chainscan-galileo.0g.ai'
    },
  },
  testnet: true,
})
```

### Technology Stack

| Component | Choice | Version | Rationale |
|-----------|--------|---------|-----------|
| **Build Tool** | Vite | 5.x | Fast HMR, existing template pattern |
| **Framework** | React | 18.x | Most popular, existing templates |
| **Language** | TypeScript | 5.x | Type safety |
| **Styling** | Tailwind CSS | 3.x | Rapid styling |
| **Wallet** | RainbowKit | 2.x | Best UX, beautiful modals |
| **Web3** | wagmi | 2.x | React hooks for Ethereum |
| **Client** | viem | 2.x | Modern, tree-shakeable |
| **Query** | TanStack Query | 5.x | Required by wagmi |
| **Animations** | Framer Motion | 11.x | Smooth micro-interactions |

### WebContainer Compatibility

**Verified Compatible:**
- `wagmi` - Pure JS, no native deps
- `viem` - Pure JS, browser-compatible
- `@rainbow-me/rainbowkit` - React components only
- `@tanstack/react-query` - Pure JS
- `framer-motion` - Pure JS

**Note on Preview**: Wallet interactions may not work in WebContainer's iframe preview due to security restrictions. The code will build and run without errors. **Deployed to Vercel, it will work fully.**

### Critical: useFrameworkReady Hook (from Expo template)

This hook signals to WebContainer when the app is ready:

```typescript
// src/hooks/useFrameworkReady.ts
import { useEffect } from 'react';

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

export function useFrameworkReady() {
  useEffect(() => {
    window.frameworkReady?.();
  }, []);
}
```

**Must be called in the root App component!**

---

## Feature Specifications

### Complete Demo Entry Point (App.tsx) - Working Swap UI

**CRITICAL**: Unlike minimal templates, this shows a **WORKING SWAP UI** immediately:

```tsx
// src/App.tsx
import './App.css';
import { useFrameworkReady } from './hooks/useFrameworkReady';
import { AnimatedBackground } from './components/ui/animated-background';
import { GlassCard } from './components/ui/glass-card';
import { GradientText } from './components/ui/gradient-text';
import { ConnectButton } from './components/web3/connect-button';
import { AccountInfo } from './components/web3/account-info';
import { SwapCard } from './components/web3/swap-card';
import { NetworkBadge } from './components/web3/network-badge';
import { useAccount } from 'wagmi';

function App() {
  useFrameworkReady();
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated gradient background with floating orbs */}
      <AnimatedBackground />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/tokens/0g.svg" alt="0G" className="w-8 h-8" />
            <GradientText className="text-xl font-bold">
              0G Swap
            </GradientText>
          </div>

          <div className="flex items-center gap-4">
            <NetworkBadge />
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center min-h-screen pt-20 pb-10 px-4">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Swap tokens on <GradientText>0G Network</GradientText>
          </h1>
          <p className="text-white/60 text-lg max-w-md mx-auto">
            The fastest decentralized exchange on the AI-native blockchain
          </p>
        </div>

        {/* Swap Card - THE MAIN FEATURE */}
        <SwapCard />

        {/* Account Info (when connected) */}
        {isConnected && (
          <GlassCard className="mt-6 p-4">
            <AccountInfo />
          </GlassCard>
        )}

        {/* Faucet Link */}
        <p className="mt-8 text-white/40 text-sm">
          Need testnet tokens?{' '}
          <a
            href="https://faucet.0g.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-400 hover:text-primary-300 underline"
          >
            Get 0G from faucet
          </a>
        </p>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 text-center">
        <p className="text-white/30 text-xs">
          Built on 0G Galileo Testnet • Chain ID: 16602
        </p>
      </footer>
    </div>
  );
}

export default App;
```

**Why complete demo?**
- User sees **working swap UI immediately** - instant wow factor
- All components are modular - LLM can easily modify/add to them
- Simple prompts like "change color" or "add portfolio" build on existing UI

---

### 1. Wallet Connection (Core)

**Requirements:**
- RainbowKit modal with custom 0G purple theme
- Supported wallets: MetaMask, WalletConnect, Coinbase Wallet
- Auto-detect 0G Galileo network
- Prompt to add network if not configured
- Persistent connection via localStorage
- Display: truncated address, native balance, network indicator

**Implementation:**
```typescript
// Wallet connect button with balance
<ConnectButton
  showBalance={true}
  chainStatus="icon"
  accountStatus="address"
/>
```

### 2. Token Balance Display

**Requirements:**
- Show native 0G balance (works immediately)
- Format with proper decimals (18)
- Refresh on block or after transaction
- Animated number transitions

**Available Tokens (from Jaine screenshots):**
| Token | Type | Notes |
|-------|------|-------|
| 0G | Native | Primary token, balance works |
| st0G | ERC-20 | Staked 0G |
| USDCe | ERC-20 | Bridged USDC |
| wETH | ERC-20 | Wrapped ETH |
| PAI | ERC-20 | Unknown utility |

> **Note**: ERC-20 token addresses not publicly documented. Template includes placeholder addresses with instructions.

### 3. DEX Swap Interface

**UI Requirements:**
- Token pair selector (from/to) with search
- Amount input with MAX button
- Price display: "1 0G = X USDCe"
- Swap direction toggle (↕️ button)
- Slippage settings popover (0.5%, 1%, 3%, custom)
- Transaction details: minimum received, price impact, LP fee
- Swap button with loading states
- Transaction status modal (pending → success/error)
- Link to block explorer on success

**Demo Mode (Default):**
Since Jaine contract addresses are not public, the template ships with **Demo Mode**:
- Full UI interactions work
- "Swap" button shows simulated transaction flow
- Clear "Demo Mode" indicator
- Easy toggle when real contracts available

**Structure for Real Integration:**
```typescript
// src/constants/contracts.ts
export const CONTRACTS = {
  // TODO: Replace with real Jaine addresses when available
  ROUTER: '0x...', // Jaine Router
  FACTORY: '0x...', // Jaine Factory

  // Token addresses (from Jaine)
  TOKENS: {
    W0G: '0x...', // Wrapped 0G (if exists)
    USDCe: '0x...',
    wETH: '0x...',
    st0G: '0x...',
  }
}
```

---

## Visual Design Specification

### Design Language: Glassmorphism + Animated Gradients

**Color Palette (0G Brand Inspired):**
```css
:root {
  /* Primary - 0G Purple */
  --primary-500: #8B5CF6;
  --primary-600: #7C3AED;

  /* Background Gradient */
  --gradient-start: #1a0533;
  --gradient-mid: #2d1b4e;
  --gradient-end: #0f172a;

  /* Glass */
  --glass-bg: rgba(255, 255, 255, 0.05);
  --glass-border: rgba(255, 255, 255, 0.1);
  --glass-blur: 20px;

  /* Accent */
  --accent-cyan: #22d3ee;
  --accent-pink: #ec4899;
}
```

**Background:**
- Animated gradient mesh (purple → blue → cyan shifting)
- Floating orbs with blur effect
- Subtle grid pattern overlay

**Glass Cards:**
```css
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}
```

**Interactive Elements:**
- Buttons: Gradient fill with glow on hover
- Inputs: Glass background with purple focus ring
- Transitions: 200ms ease-out
- Hover states: Scale 1.02 + glow

**Animations:**
| Element | Animation |
|---------|-----------|
| Page load | Staggered fade-up (100ms delay between elements) |
| Balance update | Number morph with spring physics |
| Swap button | Pulse ripple on click |
| Token select | Slide-up modal with backdrop blur |
| Success | Confetti burst + checkmark animation |

### UI Components (Atomic Design)

**Atoms:**
- `GradientButton` - Primary action button with glow
- `GlassInput` - Text input with glass styling
- `TokenIcon` - Token logo with fallback
- `NetworkBadge` - Chain indicator dot

**Molecules:**
- `TokenInput` - Amount input + token selector + MAX
- `SwapRate` - Price display with direction
- `SlippagePopover` - Settings dropdown
- `TransactionDetails` - Fee breakdown

**Organisms:**
- `SwapCard` - Complete swap interface
- `WalletHeader` - Connect button + balance
- `TokenSelectModal` - Search + list + balance
- `TransactionModal` - Status tracking

---

## File Structure (Following shadcn pattern: PRE-BUILT COMPONENTS)

**Key Learning**: shadcn template has 47 pre-built components. Our template needs pre-built Web3 components.

```
bolt-web3-defi-template/
├── .bolt/
│   ├── config.json         # {"template": "bolt-web3-defi"}
│   └── prompt              # SHORT guidance (5-10 lines)
│
├── index.html
├── package.json            # ALL deps pre-installed (wagmi, rainbowkit, etc.)
├── package-lock.json       # Lock file for fast installs
├── postcss.config.js
├── tailwind.config.js      # Glassmorphism design tokens
├── tsconfig.json
├── vite.config.ts
│
├── public/
│   └── tokens/             # Token icons (0g.svg, usdc.svg, weth.svg)
│
└── src/
    ├── main.tsx            # Providers setup (wagmi, query, rainbowkit)
    ├── App.tsx             # COMPLETE: Working swap UI demo (header, swap, footer)
    ├── App.css
    ├── index.css           # Glassmorphism CSS vars + animations
    ├── vite-env.d.ts
    │
    ├── config/
    │   ├── wagmi.ts        # RainbowKit + wagmi + 0G chain
    │   └── chains.ts       # 0G Galileo chain definition
    │
    ├── constants/
    │   ├── tokens.ts       # Token list with addresses
    │   └── abis.ts         # ERC20 ABI
    │
    ├── components/
    │   │
    │   ├── ui/             # 🎨 GLASSMORPHISM UI COMPONENTS (like shadcn)
    │   │   ├── glass-card.tsx
    │   │   ├── glass-button.tsx
    │   │   ├── glass-input.tsx
    │   │   ├── animated-background.tsx
    │   │   ├── gradient-text.tsx
    │   │   ├── shimmer.tsx
    │   │   └── number-flow.tsx
    │   │
    │   └── web3/           # 🔗 PRE-BUILT WEB3 COMPONENTS (the key value!)
    │       ├── connect-button.tsx      # Styled RainbowKit wrapper
    │       ├── account-info.tsx        # Address + balance display
    │       ├── network-badge.tsx       # Chain indicator
    │       ├── token-icon.tsx          # Token logo with fallback
    │       ├── token-balance.tsx       # Single token balance
    │       ├── token-balance-list.tsx  # Multiple token balances
    │       ├── token-input.tsx         # Amount input + MAX
    │       ├── token-select.tsx        # Token selector dropdown
    │       ├── token-select-modal.tsx  # Full token search modal
    │       ├── swap-card.tsx           # Complete swap interface
    │       ├── swap-settings.tsx       # Slippage popover
    │       ├── tx-status-modal.tsx     # Transaction progress
    │       └── explorer-link.tsx       # Link to block explorer
    │
    ├── hooks/
    │   ├── useFrameworkReady.ts  # WebContainer integration (CRITICAL!)
    │   ├── useTokenBalance.ts
    │   ├── useTokenList.ts
    │   └── useSwapQuote.ts
    │
    └── lib/
        ├── utils.ts              # cn() helper, formatters
        └── constants.ts          # Contract addresses
```

### Pre-built Components Summary (like shadcn's 47 components)

| Category | Components | Purpose |
|----------|------------|---------|
| **ui/** (7) | glass-card, glass-button, glass-input, animated-background, gradient-text, shimmer, number-flow | Glassmorphism design system |
| **web3/** (13) | connect-button, account-info, network-badge, token-icon, token-balance, token-balance-list, token-input, token-select, token-select-modal, swap-card, swap-settings, tx-status-modal, explorer-link | Web3 building blocks |
| **hooks/** (4) | useFrameworkReady, useTokenBalance, useTokenList, useSwapQuote | React hooks for Web3 |

**Total: 24 pre-built components** - LLM composes these into any Web3 app user asks for!

---

## Template Prompt (.bolt/prompt) - Customization Guidance

**Purpose**: Help LLM understand what's pre-built and how to customize.

```markdown
This is a COMPLETE Web3 DeFi demo app with a working swap interface on 0G Galileo Testnet.

WHAT'S ALREADY BUILT:
- Working swap UI with token selection, slippage settings, and transaction status
- Wallet connection via RainbowKit (MetaMask, WalletConnect, Coinbase)
- Glassmorphism design system with animated background
- 0G Galileo Testnet pre-configured (Chain ID: 16602)

PRE-BUILT COMPONENTS (use these for modifications):
- UI: GlassCard, GlassButton, GlassInput, AnimatedBackground, GradientText, Shimmer, NumberFlow
- Web3: ConnectButton, AccountInfo, NetworkBadge, TokenIcon, TokenBalance, TokenBalanceList, TokenInput, TokenSelect, TokenSelectModal, SwapCard, SwapSettings, TxStatusModal, ExplorerLink

COMMON CUSTOMIZATIONS:
- "Change colors" → Edit tailwind.config.js theme.colors
- "Add token balances" → Use <TokenBalanceList /> component
- "Add NFT section" → Create new component using GlassCard
- "Change swap tokens" → Edit src/constants/tokens.ts

NETWORK INFO:
- Faucet: https://faucet.0g.ai
- Explorer: https://chainscan-galileo.0g.ai
- Swap is in demo mode (simulated transactions) until Jaine DEX contracts are available

For stock photos, use images from Unsplash with valid URLs.
```

**Note**: This is more detailed than typical templates because we have a complete app to explain.

---

## Integration into 0G-Vibe

### 1. Add to STARTER_TEMPLATES

**File**: `app/utils/constants.ts`

```typescript
{
  name: 'Web3 DeFi',
  label: 'Web3 DeFi + 0G',
  description: 'Web3 DeFi template with wallet connect and swap interface on 0G Testnet. Glassmorphism UI.',
  githubRepo: '0glabs/bolt-web3-defi-template', // or your preferred org
  tags: ['web3', 'defi', 'swap', 'wallet', 'blockchain', 'crypto', 'dex', '0g', 'ethereum', 'metamask'],
  icon: 'i-bolt:web3',
},
```

### 2. Add Icon

**File**: `app/styles/icons.css` or wherever icons are defined

```css
.i-bolt\\:web3 {
  --icon: url("data:image/svg+xml,..."); /* Web3/wallet icon */
  -webkit-mask-image: var(--icon);
  mask-image: var(--icon);
}
```

### 3. Template Selection Triggers

The LLM will auto-select this template when user says:
- "web3 app", "dapp", "decentralized app"
- "wallet connect", "connect wallet", "metamask"
- "swap", "dex", "exchange tokens"
- "defi", "defi app", "defi dashboard"
- "blockchain app", "crypto app"
- "0g", "0g testnet"

---

## Task Breakdown (Revised - Template Pattern)

### Phase 1: Project Setup (Foundation)
| ID | Task | Description |
|----|------|-------------|
| 1.1 | Initialize Vite project | `npm create vite@latest` with React + TS |
| 1.2 | Install ALL dependencies | wagmi, viem, rainbowkit, tailwind, framer-motion, lucide-react |
| 1.3 | Configure Tailwind | Glassmorphism design tokens, CSS variables |
| 1.4 | Setup wagmi + RainbowKit | Providers, 0G Galileo chain definition |
| 1.5 | Create useFrameworkReady | WebContainer integration hook |
| 1.6 | Generate package-lock.json | For fast installs in WebContainer |

### Phase 2: Glassmorphism UI Components (src/components/ui/)
| ID | Task | Description |
|----|------|-------------|
| 2.1 | glass-card.tsx | Reusable glassmorphism container |
| 2.2 | glass-button.tsx | Gradient button with glow effects |
| 2.3 | glass-input.tsx | Styled input with glass background |
| 2.4 | animated-background.tsx | Gradient mesh + floating orbs |
| 2.5 | gradient-text.tsx | Animated gradient text |
| 2.6 | shimmer.tsx | Loading skeleton effect |
| 2.7 | number-flow.tsx | Animated number transitions |

### Phase 3: Web3 Components (src/components/web3/) - THE KEY VALUE!
| ID | Task | Description |
|----|------|-------------|
| 3.1 | connect-button.tsx | Styled RainbowKit wrapper |
| 3.2 | account-info.tsx | Address + native balance display |
| 3.3 | network-badge.tsx | Chain indicator with status |
| 3.4 | token-icon.tsx | Token logo with fallback |
| 3.5 | token-balance.tsx | Single token balance component |
| 3.6 | token-balance-list.tsx | Multiple tokens display |
| 3.7 | token-input.tsx | Amount input + MAX button |
| 3.8 | token-select.tsx | Dropdown token selector |
| 3.9 | token-select-modal.tsx | Full search modal |
| 3.10 | swap-card.tsx | Complete swap interface |
| 3.11 | swap-settings.tsx | Slippage settings popover |
| 3.12 | tx-status-modal.tsx | Transaction progress modal |
| 3.13 | explorer-link.tsx | Link to block explorer |

### Phase 4: Hooks & Utilities
| ID | Task | Description |
|----|------|-------------|
| 4.1 | useTokenBalance.ts | Fetch token balance hook |
| 4.2 | useTokenList.ts | Available tokens hook |
| 4.3 | useSwapQuote.ts | Price quote hook (mock-ready) |
| 4.4 | lib/utils.ts | cn() helper, formatAddress, formatBalance |
| 4.5 | constants/tokens.ts | Token definitions + addresses |
| 4.6 | constants/abis.ts | ERC20 ABI |

### Phase 5: Complete Demo App + Template Files
| ID | Task | Description |
|----|------|-------------|
| 5.1 | **Complete App.tsx** | Working swap UI with header, SwapCard, footer |
| 5.2 | main.tsx | Providers setup (WagmiProvider, QueryClient, RainbowKit) |
| 5.3 | .bolt/config.json | `{"template": "bolt-web3-defi"}` |
| 5.4 | .bolt/prompt | Customization guidance (what's built, how to modify) |
| 5.5 | Token icons | 0G, USDC, ETH, wETH SVGs |
| 5.6 | index.css | Complete glassmorphism design system + animations |

### Phase 6: Integration & Testing
| ID | Task | Description |
|----|------|-------------|
| 6.1 | Create GitHub repo | Public repo under org |
| 6.2 | Add to STARTER_TEMPLATES | Update constants.ts |
| 6.3 | Add i-bolt:web3 icon | Web3 icon for template selector |
| 6.4 | Test in WebContainer | Verify npm install + build + run |
| 6.5 | Test LLM composition | "Build a swap page" → uses components |
| 6.6 | Test Vercel deploy | Full wallet functionality |

---

## Success Criteria

| # | Criterion | Verification |
|---|-----------|--------------|
| 1 | Template loads in WebContainer | No build errors, UI renders |
| 2 | Code builds successfully | `npm run build` succeeds |
| 3 | Deploys to Vercel | One-click deploy works |
| 4 | Wallet connects | Can connect MetaMask |
| 5 | Network auto-added | 0G Galileo prompted if missing |
| 6 | Balance displays | Native 0G balance shows |
| 7 | Swap UI functional | Can interact with all elements |
| 8 | Demo mode works | Simulated swap completes |
| 9 | Visual wow-factor | Looks production-ready |
| 10 | LLM selects correctly | "Make a dapp" → this template |
| 11 | Customizable | "Change color to green" works |

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Jaine contracts unavailable | High | Medium | Demo mode default, easy to add later |
| RainbowKit preview issues | Medium | Low | Works on Vercel, document limitation |
| Large bundle size | Medium | Medium | Code splitting, lazy load modals |
| 0G RPC instability | Low | High | Add fallback RPC, error handling |

---

## Example Demo Prompts & Expected Results

These are the simple prompts users can give after template loads:

| User Prompt | LLM Action | Complexity |
|-------------|------------|------------|
| "Change the color scheme to green" | Edit `tailwind.config.js` colors | Simple |
| "Make the background more subtle" | Modify `AnimatedBackground` opacity/speed | Simple |
| "Add my token balances" | Add `<TokenBalanceList />` to App.tsx | Simple |
| "Show transaction history" | Create new component using `GlassCard` + fetch from explorer | Medium |
| "Add NFT gallery section" | Create NFTGallery component using existing UI components | Medium |
| "Make swap card wider" | Edit SwapCard className | Simple |
| "Add dark/light mode toggle" | Add theme context + toggle button | Medium |
| "Change logo and branding" | Replace assets + edit GradientText | Simple |

**Key Point**: All prompts build on the existing working app, not from scratch!

---

## Future Enhancements (Post-MVP)

- [ ] Add liquidity pool interface
- [ ] Token price charts (TradingView widget)
- [ ] Transaction history from explorer API
- [ ] Multiple language support
- [ ] Portfolio dashboard
- [ ] NFT gallery integration
- [ ] Bridge interface (when available)

---

## Appendix: Package.json

```json
{
  "name": "web3-defi-template",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@rainbow-me/rainbowkit": "^2.1.0",
    "@tanstack/react-query": "^5.28.0",
    "framer-motion": "^11.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "viem": "^2.9.0",
    "wagmi": "^2.5.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.4.0",
    "vite": "^5.2.0"
  }
}
```

---

---

## Template Pattern Analysis (v3 Hybrid Approach)

### Comparison: Existing Templates vs Our Approach

| Template | Entry Point | Components | .bolt/prompt | Goal |
|----------|-------------|------------|--------------|------|
| **Vite React** | "Start prompting" | None | 5 lines | General scaffolding |
| **Vite Shadcn** | "Start prompting." | 47 UI | 7 lines | UI scaffolding |
| **NextJS Shadcn** | "Start prompting." | 47 UI | 10 lines | Fullstack scaffolding |
| **Our Web3 DeFi** | **Working Swap UI** | 24 Web3+UI | 20 lines | **Demo-ready app** |

### Why v3 Hybrid is Better for Demo Purposes

| Aspect | v2 Scaffolding | v3 Hybrid (Our Choice) |
|--------|----------------|------------------------|
| First Impression | "Start prompting" text | **Working swap UI with animations** |
| User Effort | "Build me a swap page" | "Change color to green" |
| Demo Time | Build from scratch | Immediate wow, customize |
| LLM Token Usage | High (build everything) | Low (modify existing) |
| Error Risk | Higher (complex generation) | Lower (small changes) |

### How the Demo Flow Works

```
┌─────────────────────────────────────────────────────────────────┐
│  DEMO SCENARIO: "Show me 0G Vibe can build Web3 apps"          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. User: "Create a crypto swap app"                           │
│     → Template auto-selected                                    │
│     → WORKING SWAP UI appears instantly ✨                      │
│                                                                 │
│  2. User: "Make the theme green instead of purple"             │
│     → LLM edits tailwind.config.js colors                      │
│     → App updates with green theme                              │
│                                                                 │
│  3. User: "Add my token balances below the swap"               │
│     → LLM adds <TokenBalanceList /> to App.tsx                 │
│     → Balances appear with existing styling                     │
│                                                                 │
│  4. User: "Add a cool particle animation to background"        │
│     → LLM modifies AnimatedBackground component                │
│     → Particles added                                           │
│                                                                 │
│  RESULT: Impressive custom dApp in 4 simple prompts! 🚀        │
└─────────────────────────────────────────────────────────────────┘
```

### What Makes This Template Effective for Demos

1. **Instant Gratification**: Working UI on load, not blank canvas
2. **Visual Wow-Factor**: Glassmorphism + animations already implemented
3. **Simple Customizations**: LLM makes small changes, not build from scratch
4. **Modular Components**: Easy to add/remove/modify sections
5. **Real Web3 Features**: Wallet connect actually works (on Vercel)
6. **0G Branding**: Showcases the 0G ecosystem

---

## Document Approval

- [x] Network config correct (Chain ID: 16602)
- [x] Technology stack approved
- [x] **v3 Hybrid approach**: Complete demo app + reusable components
- [x] Pre-built component library (24 components)
- [x] **Working swap UI on load** (not "Start prompting")
- [x] .bolt/prompt with customization guidance
- [x] useFrameworkReady hook included
- [x] package-lock.json for fast installs
- [x] .bolt/config.json
- [x] Vercel deployment supported
- [x] Demo flow: Simple prompts for customization

**v3 Summary:**
```
Template loads → Working swap app appears → User: "Change X" → App customized

90% done on load | 10% simple customizations | 100% impressive demo
```

**Ready for implementation.** 🚀

---
---

# APPENDIX: 0G-Vibe Platform Reference

> This section contains all the context needed to build the template in a separate repository.
> The template must be compatible with how 0G-Vibe loads and executes templates.

---

## A1. How Templates Work in 0G-Vibe

**Source**: `/Users/overib/developlent/0g/0g-vibe/docs/starter-templates.md`

### Template Loading Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ USER SENDS FIRST MESSAGE                                                    │
│ "Create a Web3 swap app"                                                    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. CHECK SETTINGS                                                           │
│    - Is autoSelectTemplate enabled? (default: true)                         │
│    - Is this the first message? (chatStarted === false)                     │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                              [Yes to both]
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 2. SELECT TEMPLATE (selectStarterTemplate)                                  │
│    - Calls /api/llmcall with user message + template selection prompt       │
│    - LLM analyzes the message and selects best matching template            │
│    - Returns: { template: "Web3 DeFi", title: "Crypto Swap App" }           │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 3. FETCH TEMPLATE FILES                                                     │
│    - Calls /api/github-template?repo=[githubRepo]                           │
│    - Downloads ALL files from the GitHub repo                               │
│    - Returns array of { name, path, content }                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 4. PRE-POPULATE CHAT                                                        │
│    - Creates assistant message with <boltArtifact> containing all files     │
│    - Files are written to WebContainer                                      │
│    - npm install runs automatically                                         │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 5. CONTINUE WITH LLM                                                        │
│    - LLM sees the pre-loaded template files in context                      │
│    - LLM builds upon the template based on user's request                   │
│    - User can give simple commands to customize                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Template Selection Prompt

**Source**: `/Users/overib/developlent/0g/0g-vibe/app/utils/selectStarterTemplate.ts`

The LLM selects templates based on this prompt:

```
You are an experienced developer who helps people choose the best starter template.
IMPORTANT: Vite is preferred
IMPORTANT: Only choose shadcn templates if the user explicitly asks for shadcn.

Available templates:
<template>
  <name>Web3 DeFi</name>
  <description>Web3 DeFi template with wallet connect and swap interface on 0G Testnet</description>
  <tags>web3, defi, swap, wallet, blockchain, crypto, dex, 0g, ethereum, metamask</tags>
</template>
... (other templates)

Instructions:
1. For trivial tasks, recommend blank template
2. For complex projects, recommend templates from the list
3. Consider both technical requirements and tags
4. If no perfect match exists, recommend the closest option
```

**Our template will be selected when user mentions**: web3, wallet, swap, dex, defi, blockchain, crypto, metamask, 0g

---

## A2. WebContainer Constraints

**Source**: `/Users/overib/developlent/0g/0g-vibe/app/lib/common/prompts/prompts.ts`

The template runs in **WebContainer**, a browser-based Node.js runtime with these limitations:

### What WebContainer CAN Do:
- ✅ Run Node.js JavaScript/TypeScript
- ✅ Run npm packages (pure JS only)
- ✅ Run Vite dev server
- ✅ Execute shell commands (limited set)
- ✅ File system operations (in-memory)
- ✅ WebAssembly

### What WebContainer CANNOT Do:
- ❌ Run native binaries (no Hardhat, no Foundry)
- ❌ Run C/C++ code
- ❌ Use Python pip packages (stdlib only)
- ❌ Run git commands
- ❌ Access real filesystem
- ❌ Run Docker

### Available Shell Commands:
```
File Operations: cat, cp, ls, mkdir, mv, rm, rmdir, touch
System: hostname, ps, pwd, uptime, env
Development: node, python3 (stdlib only), jq
Utilities: curl, head, sort, tail, clear, which, chmod, kill, ln
```

### Package Compatibility Requirements:
```
✅ COMPATIBLE (Pure JS):
- wagmi, viem - Web3 libraries
- @rainbow-me/rainbowkit - Wallet UI
- @tanstack/react-query - Data fetching
- framer-motion - Animations
- tailwindcss - Styling
- lucide-react - Icons

❌ INCOMPATIBLE (Native deps):
- ethers v5 (some Node.js deps)
- hardhat, foundry (native binaries)
- ganache (native binaries)
- Any package using fs, path streams
```

---

## A3. How LLM Generates Code (Artifact Format)

**Source**: `/Users/overib/developlent/0g/0g-vibe/docs/architecture/message-flow.md`

The LLM returns code in `<boltArtifact>` format which 0G-Vibe parses and executes:

### Artifact Structure:
```xml
<boltArtifact id="unique-id" title="Descriptive Title">
  <boltAction type="file" filePath="/path/to/file.ts">
    // File content here
  </boltAction>
  <boltAction type="shell">npm install</boltAction>
  <boltAction type="start">npm run dev</boltAction>
</boltArtifact>
```

### Action Types:
| Type | Description | Example |
|------|-------------|---------|
| `file` | Create/update file in WebContainer | `<boltAction type="file" filePath="src/App.tsx">...</boltAction>` |
| `shell` | Execute shell command | `<boltAction type="shell">npm install</boltAction>` |
| `start` | Start dev server (non-blocking) | `<boltAction type="start">npm run dev</boltAction>` |

### Execution Flow:
1. Parser detects `<boltArtifact>` tags in LLM response
2. For each `<boltAction>`:
   - `type="file"` → `webcontainer.fs.writeFile()`
   - `type="shell"` → `webcontainer.spawn()`
   - `type="start"` → `webcontainer.spawn()` + wait for server-ready
3. Preview iframe shows running app

---

## A4. Template File Requirements

### Required Files:
| File | Purpose | Notes |
|------|---------|-------|
| `package.json` | Dependencies | ALL deps must be listed, auto-installs |
| `package-lock.json` | Lock file | Speeds up install in WebContainer |
| `index.html` | Entry HTML | Vite expects this |
| `vite.config.ts` | Vite config | Standard React setup |
| `tsconfig.json` | TypeScript | Standard React setup |
| `tailwind.config.js` | Tailwind | Design tokens here |
| `.bolt/config.json` | Template ID | `{"template": "bolt-web3-defi"}` |
| `.bolt/prompt` | LLM guidance | Customization instructions |

### .bolt Folder Special Files:

**`.bolt/config.json`**:
```json
{"template": "bolt-web3-defi"}
```

**`.bolt/prompt`** - Loaded and shown to LLM after template imports:
```markdown
This is a COMPLETE Web3 DeFi demo app...
(customization guidance)
```

**`.bolt/ignore`** (optional) - Files LLM should not modify:
```
src/config/wagmi.ts
src/config/chains.ts
```

### Files to Exclude:
- `.git/` - Excluded automatically
- `node_modules/` - Excluded, npm install runs fresh
- Large files (>100KB except lock files)

---

## A5. Preview & Deployment Notes

### WebContainer Preview:
- Wallet connections may NOT work in iframe preview (security restrictions)
- App will BUILD and RUN without errors
- UI will render correctly
- Web3 interactions work when deployed to Vercel

### Vercel Deployment:
- Template must build with `npm run build`
- Must work with standard Vite build output
- All Web3 features work when deployed

### Critical: useFrameworkReady Hook

This hook signals WebContainer when app is ready:

```typescript
// src/hooks/useFrameworkReady.ts
import { useEffect } from 'react';

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

export function useFrameworkReady() {
  useEffect(() => {
    window.frameworkReady?.();
  }, []);
}

// MUST call in App.tsx root component!
```

---

## A6. Integration Checklist (After Template is Built)

Once the template GitHub repo is created and populated:

### Step 1: Add to STARTER_TEMPLATES
**File**: `0g-vibe/app/utils/constants.ts`

```typescript
export const STARTER_TEMPLATES: Template[] = [
  // ... existing templates ...
  {
    name: 'Web3 DeFi',
    label: 'Web3 DeFi + 0G',
    description: 'Web3 DeFi template with wallet connect and swap interface on 0G Testnet. Glassmorphism UI.',
    githubRepo: '[org]/bolt-web3-defi-template',  // ← Your repo
    tags: ['web3', 'defi', 'swap', 'wallet', 'blockchain', 'crypto', 'dex', '0g', 'ethereum', 'metamask'],
    icon: 'i-bolt:web3',
  },
];
```

### Step 2: Add Web3 Icon
**File**: `0g-vibe/app/styles/` (wherever icons are defined)

```css
.i-bolt\:web3 {
  --icon: url("data:image/svg+xml,...");
  -webkit-mask-image: var(--icon);
  mask-image: var(--icon);
}
```

### Step 3: Test Template Selection
- Start 0G-Vibe locally
- Type: "Create a Web3 swap app"
- Verify template auto-selects and loads

---

## A7. Reference Files in 0G-Vibe Codebase

If you need to reference the original codebase:

| Purpose | File Path |
|---------|-----------|
| Template system docs | `/Users/overib/developlent/0g/0g-vibe/docs/starter-templates.md` |
| Template selection logic | `/Users/overib/developlent/0g/0g-vibe/app/utils/selectStarterTemplate.ts` |
| Template constants | `/Users/overib/developlent/0g/0g-vibe/app/utils/constants.ts` |
| Message flow docs | `/Users/overib/developlent/0g/0g-vibe/docs/architecture/message-flow.md` |
| System prompts | `/Users/overib/developlent/0g/0g-vibe/app/lib/common/prompts/prompts.ts` |
| GitHub template API | `/Users/overib/developlent/0g/0g-vibe/app/routes/api.github-template.ts` |
| Existing template example | `https://github.com/xKevIsDev/vite-shadcn` |

---

## A8. Quick Start for Template Developer

```bash
# 1. Create new repo
mkdir bolt-web3-defi-template
cd bolt-web3-defi-template
git init

# 2. Initialize Vite project
npm create vite@latest . -- --template react-ts

# 3. Install dependencies (ALL at once)
npm install wagmi viem @rainbow-me/rainbowkit @tanstack/react-query framer-motion lucide-react
npm install -D tailwindcss postcss autoprefixer

# 4. Setup Tailwind
npx tailwindcss init -p

# 5. Build the template following this document

# 6. Generate lock file
npm install  # Creates package-lock.json

# 7. Create .bolt folder
mkdir .bolt
echo '{"template": "bolt-web3-defi"}' > .bolt/config.json
# Create .bolt/prompt with customization guidance

# 8. Push to GitHub
git add .
git commit -m "Initial Web3 DeFi template"
git push origin main

# 9. Update 0G-Vibe constants.ts with your repo URL
```
