import { ExternalLink } from 'lucide-react'
import { getExplorerUrl, formatAddress } from '@/lib/utils'
import { cn } from '@/lib/utils'

export interface ExplorerLinkProps {
  /** Hash or address to link to */
  value: string
  /** Type of link */
  type?: 'tx' | 'address' | 'block'
  /** Chain ID for correct explorer URL */
  chainId?: number
  /** Show full value or truncated */
  showFull?: boolean
  /** Truncation length */
  truncateChars?: number
  /** Show icon */
  showIcon?: boolean
  /** Custom label */
  label?: string
  className?: string
}

/**
 * ExplorerLink Component
 *
 * Link to block explorer for transactions, addresses, or blocks.
 *
 * @example
 * <ExplorerLink value="0x123..." type="tx" />
 * <ExplorerLink value="0xabc..." type="address" showFull={false} />
 */
export function ExplorerLink({
  value,
  type = 'tx',
  chainId,
  showFull = false,
  truncateChars = 6,
  showIcon = true,
  label,
  className,
}: ExplorerLinkProps) {
  const url = getExplorerUrl(value, type, chainId)
  const displayText = label || (showFull ? value : formatAddress(value, truncateChars))

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex items-center gap-1.5',
        'text-primary-400 hover:text-primary-300',
        'transition-colors',
        'font-mono text-sm',
        className
      )}
    >
      {displayText}
      {showIcon && <ExternalLink className="w-3.5 h-3.5" />}
    </a>
  )
}

/**
 * TxLink Component
 *
 * Shorthand for transaction explorer links.
 */
export function TxLink({
  hash,
  chainId,
  ...props
}: Omit<ExplorerLinkProps, 'value' | 'type'> & { hash: string }) {
  return <ExplorerLink value={hash} type="tx" chainId={chainId} {...props} />
}

/**
 * AddressLink Component
 *
 * Shorthand for address explorer links.
 */
export function AddressLink({
  address,
  chainId,
  ...props
}: Omit<ExplorerLinkProps, 'value' | 'type'> & { address: string }) {
  return <ExplorerLink value={address} type="address" chainId={chainId} {...props} />
}

export default ExplorerLink
