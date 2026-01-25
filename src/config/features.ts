/**
 * Feature Configuration System
 *
 * Config-driven architecture for template flexibility.
 * Allows enabling/disabling features and customizing behavior.
 */

import { hasDexSupport } from './chains'

export interface SwapFeatureConfig {
  enabled: boolean
  showChart: boolean        // Show chart panel next to swap
  showPriceImpact: boolean
  showNetworkFee: boolean
  showMinReceived: boolean
}

export interface PoolsFeatureConfig {
  enabled: boolean
  showMyPositions: boolean
  allowCreatePool: boolean
}

export interface ChartFeatureConfig {
  enabled: boolean
  defaultTimeRange: '1H' | '24H' | '7D' | '30D' | '1Y'
  showMockDataWarning: boolean  // Show "Demo Data" label
}

export interface PortfolioFeatureConfig {
  enabled: boolean
  showHoldings: boolean
  showActivity: boolean
}

export interface UIFeatureConfig {
  showNetworkBadge: boolean
  showFaucetLink: boolean
  animatedBackground: boolean
  showMainnetWarning: boolean
}

export interface FeatureConfig {
  swap: SwapFeatureConfig
  pools: PoolsFeatureConfig
  chart: ChartFeatureConfig
  portfolio: PortfolioFeatureConfig
  ui: UIFeatureConfig
}

/**
 * Default config - all features enabled
 */
export const DEFAULT_FEATURES: FeatureConfig = {
  swap: {
    enabled: true,
    showChart: true,
    showPriceImpact: true,
    showNetworkFee: true,
    showMinReceived: true,
  },
  pools: {
    enabled: true,
    showMyPositions: true,
    allowCreatePool: true,
  },
  chart: {
    enabled: true,
    defaultTimeRange: '24H',
    showMockDataWarning: true,
  },
  portfolio: {
    enabled: true,
    showHoldings: true,
    showActivity: true,
  },
  ui: {
    showNetworkBadge: true,
    showFaucetLink: true,
    animatedBackground: true,
    showMainnetWarning: true,
  },
}

/**
 * Minimal config - swap only
 */
export const MINIMAL_FEATURES: FeatureConfig = {
  swap: {
    enabled: true,
    showChart: false,
    showPriceImpact: true,
    showNetworkFee: false,
    showMinReceived: true,
  },
  pools: {
    enabled: false,
    showMyPositions: false,
    allowCreatePool: false,
  },
  chart: {
    enabled: false,
    defaultTimeRange: '24H',
    showMockDataWarning: true,
  },
  portfolio: {
    enabled: false,
    showHoldings: false,
    showActivity: false,
  },
  ui: {
    showNetworkBadge: true,
    showFaucetLink: true,
    animatedBackground: true,
    showMainnetWarning: true,
  },
}

/**
 * Resolve features based on chain capabilities
 * Some features auto-disable if chain doesn't support them
 */
export function resolveFeatures(config: FeatureConfig, chainId: number): FeatureConfig {
  const hasDex = hasDexSupport(chainId)

  return {
    ...config,
    swap: {
      ...config.swap,
      // Swap still works in demo mode, but some features need DEX
      showNetworkFee: config.swap.showNetworkFee && hasDex,
    },
    pools: {
      ...config.pools,
      // Pools require DEX support
      enabled: config.pools.enabled && hasDex,
    },
    // Chart can work with mock data even without DEX
    chart: {
      ...config.chart,
      showMockDataWarning: !hasDex || config.chart.showMockDataWarning,
    },
    // Portfolio works regardless of DEX (shows token balances)
    portfolio: config.portfolio,
    ui: config.ui,
  }
}

/**
 * Deep merge utility for partial configs
 */
export function mergeFeatures(
  base: FeatureConfig,
  overrides: Partial<{
    swap: Partial<SwapFeatureConfig>
    pools: Partial<PoolsFeatureConfig>
    chart: Partial<ChartFeatureConfig>
    portfolio: Partial<PortfolioFeatureConfig>
    ui: Partial<UIFeatureConfig>
  }>
): FeatureConfig {
  return {
    swap: { ...base.swap, ...overrides.swap },
    pools: { ...base.pools, ...overrides.pools },
    chart: { ...base.chart, ...overrides.chart },
    portfolio: { ...base.portfolio, ...overrides.portfolio },
    ui: { ...base.ui, ...overrides.ui },
  }
}
