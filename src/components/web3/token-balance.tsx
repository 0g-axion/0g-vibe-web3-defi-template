import { useAccount, useBalance, useReadContract } from 'wagmi'
import { formatBalance } from '@/lib/utils'
import { BalanceDisplay } from '@/components/ui/number-flow'
import { Shimmer } from '@/components/ui/shimmer'
import { TokenIcon } from './token-icon'
import { ERC20_ABI } from '@/constants/abis'
import type { Token } from '@/constants/tokens'
import { cn } from '@/lib/utils'

export interface TokenBalanceProps {
  /** Token to display balance for */
  token: Token
  /** Show token icon */
  showIcon?: boolean
  /** Show token name */
  showName?: boolean
  /** Compact mode */
  compact?: boolean
  className?: string
}

/**
 * TokenBalance Component
 *
 * Displays the balance of a single token for the connected wallet.
 *
 * @example
 * <TokenBalance token={NATIVE_TOKEN} showIcon showName />
 */
export function TokenBalance({
  token,
  showIcon = true,
  showName = false,
  compact = false,
  className,
}: TokenBalanceProps) {
  const { address } = useAccount()

  // Native token balance
  const { data: nativeBalance, isLoading: nativeLoading } = useBalance({
    address,
    query: { enabled: token.isNative },
  })

  // ERC-20 token balance
  const { data: erc20Balance, isLoading: erc20Loading } = useReadContract({
    address: token.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !token.isNative && !!address },
  })

  const isLoading = token.isNative ? nativeLoading : erc20Loading

  const balance = token.isNative
    ? nativeBalance
      ? formatBalance(nativeBalance.value, nativeBalance.decimals)
      : '0'
    : erc20Balance
    ? formatBalance(erc20Balance as bigint, token.decimals)
    : '0'

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {showIcon && (
          <TokenIcon symbol={token.symbol} src={token.logoURI} size={20} />
        )}
        {isLoading ? (
          <Shimmer width={60} height={16} rounded="sm" />
        ) : (
          <span className="font-mono text-sm text-white">
            {balance} {token.symbol}
          </span>
        )}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex items-center justify-between p-3 rounded-xl',
        'bg-white/5 hover:bg-white/[0.07] transition-colors',
        className
      )}
    >
      <div className="flex items-center gap-3">
        {showIcon && (
          <TokenIcon symbol={token.symbol} src={token.logoURI} size={36} />
        )}
        <div>
          <span className="font-medium text-white">{token.symbol}</span>
          {showName && (
            <p className="text-sm text-white/50">{token.name}</p>
          )}
        </div>
      </div>

      <div className="text-right">
        {isLoading ? (
          <Shimmer width={80} height={20} rounded="sm" />
        ) : (
          <BalanceDisplay
            balance={balance}
            decimals={4}
            className="text-white font-medium"
          />
        )}
      </div>
    </div>
  )
}

export default TokenBalance
