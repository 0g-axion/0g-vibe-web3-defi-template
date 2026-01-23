import { useAccount } from 'wagmi'
import { TokenBalance } from './token-balance'
import { GlassCard } from '@/components/ui/glass-card'
import { TOKENS, type Token } from '@/constants/tokens'
import { cn } from '@/lib/utils'

export interface TokenBalanceListProps {
  /** Tokens to display (defaults to all tokens) */
  tokens?: Token[]
  /** Title for the section */
  title?: string
  /** Show empty balances */
  showEmpty?: boolean
  /** Maximum tokens to show */
  maxTokens?: number
  className?: string
}

/**
 * TokenBalanceList Component
 *
 * Displays a list of token balances for the connected wallet.
 *
 * @example
 * <TokenBalanceList title="Your Balances" showEmpty={false} />
 */
export function TokenBalanceList({
  tokens = TOKENS,
  title = 'Token Balances',
  showEmpty: _showEmpty = true, // Reserved for future filtering
  maxTokens,
  className,
}: TokenBalanceListProps) {
  const { isConnected } = useAccount()

  const displayTokens = maxTokens ? tokens.slice(0, maxTokens) : tokens

  if (!isConnected) {
    return (
      <GlassCard className={cn('p-4', className)}>
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <p className="text-white/50 text-center py-4">
          Connect wallet to view balances
        </p>
      </GlassCard>
    )
  }

  return (
    <GlassCard className={cn('p-4', className)}>
      {title && (
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      )}

      <div className="space-y-2">
        {displayTokens.map((token) => (
          <TokenBalance
            key={token.symbol}
            token={token}
            showIcon
            showName
          />
        ))}
      </div>

      {maxTokens && tokens.length > maxTokens && (
        <p className="text-center text-sm text-white/40 mt-3">
          +{tokens.length - maxTokens} more tokens
        </p>
      )}
    </GlassCard>
  )
}

export default TokenBalanceList
