/**
 * Hooks Barrel Export
 *
 * All hooks are exported from here for convenient imports:
 * import { useSwap, useTokenBalance, usePortfolio } from '@/hooks'
 */

// Core hooks
export { useFrameworkReady } from './useFrameworkReady'

// Token hooks
export { useTokenBalance, type UseTokenBalanceOptions, type UseTokenBalanceResult } from './useTokenBalance'
export { useTokenList, type UseTokenListOptions, type UseTokenListResult } from './useTokenList'
export { useTokenPrices } from './useTokenPrices'

// Swap hooks
export { useSwapQuote, type UseSwapQuoteOptions, type UseSwapQuoteResult, type SwapQuote } from './useSwapQuote'
export { useSwap, type SwapParams, type SwapResult, type SwapStatus } from './useSwap'

// Pool hooks
export { usePools, type PoolWithState, type PoolState } from './usePools'
export { useSubgraphPools, type PoolData, type ProtocolStats } from './useSubgraphPools'

// Chart hooks
export { useChartData, type TimeRange, type ChartDataPoint, type ChartData } from './useChartData'

// Portfolio hooks
export { usePortfolio, type TokenHolding } from './usePortfolio'
export { useUserTransactions, type UserTransaction } from './useUserTransactions'

// Wallet hooks
export { useWalletConnection } from './use-wallet-connection'
export { useWalletInfo } from './use-wallet-info'

// UI hooks
export { useToast, toast } from './use-toast'
