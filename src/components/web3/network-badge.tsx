import { useAccount, useChainId } from 'wagmi'
import { cn } from '@/lib/utils'
import { chainMetadata } from '@/config/chains'

export interface NetworkBadgeProps {
  /** Show full network name */
  showName?: boolean
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeStyles = {
  sm: 'h-1.5 w-1.5',
  md: 'h-2 w-2',
  lg: 'h-2.5 w-2.5',
}

const textSizes = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
}

/**
 * NetworkBadge Component
 *
 * Shows the current network status with a colored indicator dot.
 *
 * @example
 * <NetworkBadge showName size="md" />
 */
export function NetworkBadge({
  showName = true,
  size = 'md',
  className,
}: NetworkBadgeProps) {
  const { isConnected } = useAccount()
  const chainId = useChainId()

  const isCorrectNetwork = chainId === chainMetadata.id
  const networkName = isCorrectNetwork
    ? chainMetadata.name
    : 'Wrong Network'

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Status dot */}
      <div className="relative">
        <div
          className={cn(
            'rounded-full',
            sizeStyles[size],
            isConnected
              ? isCorrectNetwork
                ? 'bg-accent-green'
                : 'bg-accent-red'
              : 'bg-white/30'
          )}
        />
        {/* Pulse animation when connected */}
        {isConnected && isCorrectNetwork && (
          <div
            className={cn(
              'absolute inset-0 rounded-full bg-accent-green animate-ping opacity-75',
              sizeStyles[size]
            )}
          />
        )}
      </div>

      {/* Network name */}
      {showName && (
        <span
          className={cn(
            'font-medium',
            textSizes[size],
            isConnected
              ? isCorrectNetwork
                ? 'text-white/70'
                : 'text-accent-red'
              : 'text-white/40'
          )}
        >
          {isConnected ? networkName : 'Not Connected'}
        </span>
      )}
    </div>
  )
}

export default NetworkBadge
