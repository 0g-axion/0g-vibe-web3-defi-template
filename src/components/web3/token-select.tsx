import { useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { TokenIcon } from './token-icon'
import { GlassButton } from '@/components/ui/glass-button'
import { TOKENS, type Token } from '@/constants/tokens'
import { cn } from '@/lib/utils'

export interface TokenSelectProps {
  /** Currently selected token */
  value: Token
  /** Change handler */
  onChange: (token: Token) => void
  /** Tokens to exclude from list */
  excludeTokens?: string[]
  /** Available tokens (defaults to all) */
  tokens?: Token[]
  /** Disabled state */
  disabled?: boolean
  className?: string
}

/**
 * TokenSelect Component
 *
 * Dropdown token selector.
 *
 * @example
 * <TokenSelect
 *   value={selectedToken}
 *   onChange={setSelectedToken}
 *   excludeTokens={['ETH']}
 * />
 */
export function TokenSelect({
  value,
  onChange,
  excludeTokens = [],
  tokens = TOKENS,
  disabled = false,
  className,
}: TokenSelectProps) {
  const [isOpen, setIsOpen] = useState(false)

  const availableTokens = tokens.filter(
    (t) => !excludeTokens.includes(t.symbol)
  )

  const handleSelect = (token: Token) => {
    onChange(token)
    setIsOpen(false)
  }

  return (
    <div className={cn('relative', className)}>
      {/* Trigger Button */}
      <GlassButton
        variant="default"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="gap-2 min-w-[140px]"
      >
        <TokenIcon symbol={value.symbol} src={value.logoURI} size={24} />
        <span className="font-semibold">{value.symbol}</span>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-white/50 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </GlassButton>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div
            className={cn(
              'absolute top-full mt-2 right-0 z-50',
              'min-w-[200px] max-h-[300px] overflow-auto',
              'rounded-xl p-2',
              'bg-background-mid/95 backdrop-blur-xl',
              'border border-white/10',
              'shadow-lg shadow-black/20',
              'animate-scale-in'
            )}
          >
            {availableTokens.map((token) => (
              <button
                key={token.symbol}
                onClick={() => handleSelect(token)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg',
                  'hover:bg-white/10 transition-colors',
                  'text-left',
                  token.symbol === value.symbol && 'bg-white/5'
                )}
              >
                <TokenIcon
                  symbol={token.symbol}
                  src={token.logoURI}
                  size={32}
                />
                <div className="flex-1">
                  <span className="font-medium text-white">{token.symbol}</span>
                  <p className="text-xs text-white/50">{token.name}</p>
                </div>
                {token.symbol === value.symbol && (
                  <Check className="w-4 h-4 text-primary-400" />
                )}
              </button>
            ))}

            {availableTokens.length === 0 && (
              <p className="text-center text-white/50 py-4">
                No tokens available
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default TokenSelect
