import { useAccount, useBalance } from 'wagmi'
import { Copy, ExternalLink, Check } from 'lucide-react'
import { useState } from 'react'
import { formatAddress, formatBalance, getExplorerUrl } from '@/lib/utils'
import { GlassButton } from '@/components/ui/glass-button'
import { BalanceDisplay } from '@/components/ui/number-flow'
import { Shimmer } from '@/components/ui/shimmer'
import { cn } from '@/lib/utils'

export interface AccountInfoProps {
  /** Show copy address button */
  showCopy?: boolean
  /** Show explorer link */
  showExplorer?: boolean
  /** Compact mode */
  compact?: boolean
  className?: string
}

/**
 * AccountInfo Component
 *
 * Displays connected wallet address and native balance.
 *
 * @example
 * <AccountInfo showCopy showExplorer />
 */
export function AccountInfo({
  showCopy = true,
  showExplorer = true,
  compact = false,
  className,
}: AccountInfoProps) {
  const { address, isConnected } = useAccount()
  const { data: balance, isLoading } = useBalance({ address })
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!address) return
    await navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isConnected || !address) {
    return null
  }

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <span className="font-mono text-sm text-white/70">
          {formatAddress(address)}
        </span>
        {showCopy && (
          <button
            onClick={handleCopy}
            className="text-white/50 hover:text-white transition-colors"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-accent-green" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </div>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Address */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-white/50">Address</span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-white">{formatAddress(address, 6)}</span>
          {showCopy && (
            <GlassButton
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="!p-1.5"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-accent-green" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </GlassButton>
          )}
          {showExplorer && (
            <GlassButton
              variant="ghost"
              size="sm"
              className="!p-1.5"
              onClick={() =>
                window.open(getExplorerUrl(address, 'address'), '_blank')
              }
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </GlassButton>
          )}
        </div>
      </div>

      {/* Balance */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-white/50">Balance</span>
        {isLoading ? (
          <Shimmer width={80} height={20} rounded="sm" />
        ) : balance ? (
          <BalanceDisplay
            balance={formatBalance(balance.value, balance.decimals)}
            symbol={balance.symbol}
            className="text-white font-medium"
          />
        ) : (
          <span className="text-white/50">0.00</span>
        )}
      </div>
    </div>
  )
}

export default AccountInfo
