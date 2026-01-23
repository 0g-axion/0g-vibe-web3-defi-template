import { useAccount, useBalance, useReadContract } from 'wagmi'
import { formatBalance } from '@/lib/utils'
import { ERC20_ABI } from '@/constants/abis'
import type { Token } from '@/constants/tokens'

export interface UseTokenBalanceOptions {
  /** Token to fetch balance for */
  token: Token
  /** Whether to watch for updates */
  watch?: boolean
}

export interface UseTokenBalanceResult {
  /** Formatted balance string */
  balance: string
  /** Raw balance in smallest unit */
  balanceRaw: bigint
  /** Whether balance is loading */
  isLoading: boolean
  /** Error if any */
  error: Error | null
  /** Refetch balance */
  refetch: () => void
}

/**
 * useTokenBalance Hook
 *
 * Fetches the balance of a token for the connected wallet.
 * Handles both native tokens and ERC-20 tokens.
 *
 * @example
 * const { balance, isLoading } = useTokenBalance({ token: NATIVE_TOKEN })
 */
export function useTokenBalance({
  token,
  watch = false,
}: UseTokenBalanceOptions): UseTokenBalanceResult {
  const { address } = useAccount()

  // Native token balance
  const {
    data: nativeBalance,
    isLoading: nativeLoading,
    error: nativeError,
    refetch: nativeRefetch,
  } = useBalance({
    address,
    query: {
      enabled: token.isNative && !!address,
      refetchInterval: watch ? 10000 : false,
    },
  })

  // ERC-20 token balance
  const {
    data: erc20Balance,
    isLoading: erc20Loading,
    error: erc20Error,
    refetch: erc20Refetch,
  } = useReadContract({
    address: token.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !token.isNative && !!address,
      refetchInterval: watch ? 10000 : false,
    },
  })

  if (token.isNative) {
    return {
      balance: nativeBalance
        ? formatBalance(nativeBalance.value, nativeBalance.decimals)
        : '0',
      balanceRaw: nativeBalance?.value ?? BigInt(0),
      isLoading: nativeLoading,
      error: nativeError,
      refetch: nativeRefetch,
    }
  }

  return {
    balance: erc20Balance
      ? formatBalance(erc20Balance as bigint, token.decimals)
      : '0',
    balanceRaw: (erc20Balance as bigint) ?? BigInt(0),
    isLoading: erc20Loading,
    error: erc20Error,
    refetch: erc20Refetch,
  }
}

export default useTokenBalance
