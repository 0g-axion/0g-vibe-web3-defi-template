/**
 * useUserTransactions Hook
 *
 * Fetches user's transaction history from the subgraph.
 * Includes swaps, liquidity adds, and liquidity removes.
 */

import { useQuery } from '@tanstack/react-query'
import { useChainId, useAccount } from 'wagmi'
import { fetchUserTransactions, type UserTransaction } from '@/services/subgraph'
import { hasSubgraphSupport } from '@/config/subgraph'

export type { UserTransaction }

export function useUserTransactions(limit = 20) {
  const chainId = useChainId()
  const { address, isConnected } = useAccount()
  const hasSubgraph = hasSubgraphSupport(chainId)

  const {
    data: transactions,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['userTransactions', chainId, address, limit],
    queryFn: () => fetchUserTransactions(chainId, address!, limit),
    enabled: hasSubgraph && isConnected && !!address,
    staleTime: 30_000, // 30 seconds
    refetchInterval: 60_000, // Refetch every minute
  })

  return {
    transactions: transactions ?? [],
    isLoading,
    error,
    refetch,
    hasSubgraph,
    hasTransactions: (transactions?.length ?? 0) > 0,
  }
}

export default useUserTransactions
