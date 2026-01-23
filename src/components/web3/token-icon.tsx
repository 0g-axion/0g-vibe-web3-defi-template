import { useState } from 'react'
import { cn } from '@/lib/utils'

export interface TokenIconProps {
  /** Token symbol */
  symbol: string
  /** Image source URL */
  src?: string
  /** Size in pixels */
  size?: number
  /** Show border */
  showBorder?: boolean
  className?: string
}

/**
 * TokenIcon Component
 *
 * Displays a token icon with fallback to symbol initials.
 *
 * @example
 * <TokenIcon symbol="0G" src="/tokens/0g.svg" size={32} />
 */
export function TokenIcon({
  symbol,
  src,
  size = 32,
  showBorder = true,
  className,
}: TokenIconProps) {
  const [hasError, setHasError] = useState(false)

  // Generate fallback background color from symbol
  const getColorFromSymbol = (s: string) => {
    const colors = [
      'bg-primary-500',
      'bg-accent-cyan',
      'bg-accent-pink',
      'bg-accent-green',
      'bg-yellow-500',
      'bg-orange-500',
    ]
    let hash = 0
    for (let i = 0; i < s.length; i++) {
      hash = s.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }

  const initials = symbol.slice(0, 2).toUpperCase()

  return (
    <div
      className={cn(
        'relative flex items-center justify-center rounded-full overflow-hidden',
        'bg-white/10',
        showBorder && 'ring-2 ring-white/10',
        className
      )}
      style={{ width: size, height: size }}
    >
      {src && !hasError ? (
        <img
          src={src}
          alt={symbol}
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <div
          className={cn(
            'w-full h-full flex items-center justify-center',
            getColorFromSymbol(symbol)
          )}
        >
          <span
            className="font-bold text-white"
            style={{ fontSize: size * 0.4 }}
          >
            {initials}
          </span>
        </div>
      )}
    </div>
  )
}

/**
 * TokenIconPair Component
 *
 * Displays two token icons overlapping (for LP tokens or pairs).
 */
export function TokenIconPair({
  token0Symbol,
  token0Src,
  token1Symbol,
  token1Src,
  size = 32,
  className,
}: {
  token0Symbol: string
  token0Src?: string
  token1Symbol: string
  token1Src?: string
  size?: number
  className?: string
}) {
  return (
    <div
      className={cn('relative flex items-center', className)}
      style={{ width: size * 1.5, height: size }}
    >
      <TokenIcon
        symbol={token0Symbol}
        src={token0Src}
        size={size}
        className="z-10"
      />
      <TokenIcon
        symbol={token1Symbol}
        src={token1Src}
        size={size}
        className="-ml-3"
      />
    </div>
  )
}

export default TokenIcon
