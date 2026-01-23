import { useAccount, useBalance, useReadContract } from 'wagmi'
import { formatBalance } from '@/lib/utils'
import { GlassButton } from '@/components/ui/glass-button'
import { TokenIcon } from './token-icon'
import { ERC20_ABI } from '@/constants/abis'
import type { Token } from '@/constants/tokens'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

export interface TokenInputProps {
  /** Current value */
  value: string
  /** Change handler */
  onChange: (value: string) => void
  /** Selected token */
  token: Token
  /** Click handler for token selector */
  onTokenClick?: () => void
  /** Label text */
  label?: string
  /** Show balance */
  showBalance?: boolean
  /** Show MAX button */
  showMax?: boolean
  /** Disable input */
  disabled?: boolean
  /** USD value to display */
  usdValue?: string
  className?: string
}

/**
 * TokenInput Component
 *
 * Amount input with token selector and MAX button.
 *
 * @example
 * <TokenInput
 *   value={amount}
 *   onChange={setAmount}
 *   token={selectedToken}
 *   onTokenClick={() => setShowSelector(true)}
 *   showBalance
 *   showMax
 * />
 */
export function TokenInput({
  value,
  onChange,
  token,
  onTokenClick,
  label,
  showBalance = true,
  showMax = true,
  disabled = false,
  usdValue,
  className,
}: TokenInputProps) {
  const { address } = useAccount()

  // Native balance
  const { data: nativeBalance } = useBalance({
    address,
    query: { enabled: token.isNative },
  })

  // ERC-20 balance
  const { data: erc20Balance } = useReadContract({
    address: token.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !token.isNative && !!address },
  })

  const balance = token.isNative
    ? nativeBalance
      ? formatBalance(nativeBalance.value, nativeBalance.decimals)
      : '0'
    : erc20Balance
    ? formatBalance(erc20Balance as bigint, token.decimals)
    : '0'

  const handleMax = () => {
    onChange(balance)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    // Only allow numbers and decimal point
    if (/^[0-9]*\.?[0-9]*$/.test(val) || val === '') {
      onChange(val)
    }
  }

  return (
    <div
      className={cn(
        'rounded-2xl p-4',
        'bg-black/20 border border-white/5',
        'focus-within:border-primary-500/50 transition-colors',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        {label && <span className="text-sm text-white/50">{label}</span>}
        {showBalance && address && (
          <span className="text-sm text-white/50">
            Balance: <span className="text-white/70">{balance}</span>
          </span>
        )}
      </div>

      {/* Input Row */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          inputMode="decimal"
          placeholder="0.00"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className={cn(
            'flex-1 bg-transparent outline-none',
            'text-2xl font-medium text-white',
            'placeholder:text-white/30',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        />

        {/* Token Selector */}
        <button
          onClick={onTokenClick}
          disabled={disabled}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-xl',
            'bg-white/10 hover:bg-white/15 transition-colors',
            'border border-white/10',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <TokenIcon symbol={token.symbol} src={token.logoURI} size={24} />
          <span className="font-semibold text-white">{token.symbol}</span>
          <ChevronDown className="w-4 h-4 text-white/50" />
        </button>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-2">
        {usdValue && (
          <span className="text-sm text-white/40">≈ ${usdValue}</span>
        )}
        <div className="flex-1" />
        {showMax && address && (
          <GlassButton
            variant="ghost"
            size="sm"
            onClick={handleMax}
            disabled={disabled}
            className="!text-xs !px-2 !py-1 text-primary-400"
          >
            MAX
          </GlassButton>
        )}
      </div>
    </div>
  )
}

export default TokenInput
