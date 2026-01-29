/**
 * Feature Provider
 *
 * Provides feature configuration to the component tree.
 * Components can use useFeatures() to access feature flags.
 */

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useChainId } from 'wagmi'
import {
  DEFAULT_FEATURES,
  MINIMAL_FEATURES,
  resolveFeatures,
  mergeFeatures,
  type FeatureConfig,
  type SwapFeatureConfig,
  type PoolsFeatureConfig,
  type ChartFeatureConfig,
  type PortfolioFeatureConfig,
  type UIFeatureConfig,
} from '@/config/features'

// Re-export utilities for convenient access
// This allows: import { FeatureProvider, mergeFeatures, DEFAULT_FEATURES } from './providers/feature-provider'
export { DEFAULT_FEATURES, MINIMAL_FEATURES, mergeFeatures }

const FeatureContext = createContext<FeatureConfig>(DEFAULT_FEATURES)

export interface FeatureProviderProps {
  /**
   * Feature configuration overrides.
   * Will be merged with DEFAULT_FEATURES and resolved based on chain.
   */
  config?: Partial<{
    swap: Partial<SwapFeatureConfig>
    pools: Partial<PoolsFeatureConfig>
    chart: Partial<ChartFeatureConfig>
    portfolio: Partial<PortfolioFeatureConfig>
    ui: Partial<UIFeatureConfig>
  }>
  children: ReactNode
}

/**
 * Feature Provider Component
 *
 * Wraps the app to provide feature configuration.
 * Automatically resolves features based on current chain.
 *
 * @example
 * // Use all default features
 * <FeatureProvider>
 *   <App />
 * </FeatureProvider>
 *
 * @example
 * // Customize features
 * <FeatureProvider config={{ pools: { enabled: false } }}>
 *   <App />
 * </FeatureProvider>
 */
export function FeatureProvider({ config, children }: FeatureProviderProps) {
  const chainId = useChainId()

  const resolvedConfig = useMemo(() => {
    // Start with defaults
    let features = DEFAULT_FEATURES

    // Apply user overrides
    if (config) {
      features = mergeFeatures(features, config)
    }

    // Resolve based on chain capabilities
    features = resolveFeatures(features, chainId)

    return features
  }, [config, chainId])

  return (
    <FeatureContext.Provider value={resolvedConfig}>
      {children}
    </FeatureContext.Provider>
  )
}

/**
 * Hook to access feature configuration
 *
 * @example
 * const features = useFeatures()
 * if (features.pools.enabled) {
 *   // Show pools tab
 * }
 */
export function useFeatures(): FeatureConfig {
  return useContext(FeatureContext)
}

/**
 * Hook to check if a specific feature is enabled
 *
 * @example
 * const isPoolsEnabled = useFeatureEnabled('pools')
 */
export function useFeatureEnabled(
  feature: 'swap' | 'pools' | 'chart' | 'portfolio'
): boolean {
  const features = useFeatures()
  return features[feature].enabled
}

export default FeatureProvider
