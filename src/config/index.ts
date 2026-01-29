/**
 * Config Barrel Export
 *
 * Import all config from here:
 * import { BRAND_COLORS, DEFAULT_FEATURES, zgMainnet } from '@/config'
 */

// Theme & Design
export {
  BRAND_COLORS,
  RAINBOWKIT_THEME,
  DESIGN_TOKENS,
  ANIMATION_CONFIG,
  type BrandColors,
  type DesignTokens,
} from './theme'

// Features
export {
  DEFAULT_FEATURES,
  MINIMAL_FEATURES,
  mergeFeatures,
  resolveFeatures,
  type FeatureConfig,
  type SwapFeatureConfig,
  type PoolsFeatureConfig,
  type ChartFeatureConfig,
  type PortfolioFeatureConfig,
  type UIFeatureConfig,
} from './features'

// Chains
export {
  zgMainnet,
  zgTestnet,
  defaultChain,
  hasDexSupport,
  getChainMetadata,
  CHAIN_IDS,
  supportedChains,
} from './chains'

// Wagmi
export { config as wagmiConfig, rainbowTheme } from './wagmi'

// Subgraph
export {
  getSubgraphUrl,
  hasSubgraphSupport,
  getDefaultChartPool,
} from './subgraph'
