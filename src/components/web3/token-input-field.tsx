/**
 * TokenInputField Component
 *
 * Premium token input with real balance fetching.
 * Combines new UI design from dex/TokenInputField with working balance logic.
 */
import { useRef } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useAccount, useBalance, useReadContract } from 'wagmi'
import type { Token } from '@/constants/tokens'
import { ERC20_ABI } from '@/constants/abis'
import { formatBalance, cn } from '@/lib/utils'
import { Shimmer } from '@/components/ui/shimmer'

interface TokenInputFieldProps {
  label: string
  token: Token
  value: string
  onChange: (value: string) => void
  onTokenClick: (rect: DOMRect) => void
  showMax?: boolean
  disabled?: boolean
}

export function TokenInputField({
  label,
  token,
  value,
  onChange,
  onTokenClick,
  showMax,
  disabled
}: TokenInputFieldProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const { address } = useAccount()

  // Native balance
  const { data: nativeBalance, isLoading: nativeLoading } = useBalance({
    address,
    query: { enabled: token.isNative && !!address },
  })

  // ERC-20 balance
  const { data: erc20Balance, isLoading: erc20Loading } = useReadContract({
    address: token.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !token.isNative && !!address && token.address !== 'native' },
  })

  const isLoadingBalance = token.isNative ? nativeLoading : erc20Loading
  const balance = token.isNative
    ? nativeBalance ? formatBalance(nativeBalance.value, nativeBalance.decimals) : '0'
    : erc20Balance ? formatBalance(erc20Balance as bigint, token.decimals) : '0'

  // Calculate USD value (mock for now, will be replaced with real price in Phase 2)
  const usdValue = value ? (parseFloat(value) * (token.symbol === '0G' ? 0.05 : token.symbol.includes('USD') ? 1 : 1850)).toFixed(2) : '0.00'

  const handleTokenClick = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      onTokenClick(rect)
    }
  }

  const handleMaxClick = () => {
    if (balance && balance !== '0') {
      onChange(balance)
    }
  }

  return (
    <div className={cn(
      "rounded-2xl p-4 transition-colors overflow-hidden",
      disabled ? "bg-white/[0.02]" : "bg-white/5 hover:bg-white/[0.07]"
    )}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-white/50">{label}</span>
        {showMax && address && (
          <div className="flex items-center gap-2">
            {isLoadingBalance ? (
              <Shimmer width={60} height={16} rounded="sm" />
            ) : (
              <span className="text-sm text-white/50">Balance: {balance}</span>
            )}
            <button
              onClick={handleMaxClick}
              disabled={!balance || balance === '0'}
              className="text-xs text-violet-400 hover:text-violet-300 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              MAX
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 min-w-0">
        <input
          type="text"
          inputMode="decimal"
          placeholder="0"
          value={value}
          onChange={(e) => {
            const val = e.target.value.replace(/[^0-9.]/g, '')
            if (val === '' || /^\d*\.?\d*$/.test(val)) {
              onChange(val)
            }
          }}
          disabled={disabled}
          className={cn(
            "flex-1 min-w-0 bg-transparent text-3xl font-medium outline-none placeholder-white/20",
            disabled ? "text-white/50" : "text-white"
          )}
        />

        <motion.button
          ref={buttonRef}
          onClick={handleTokenClick}
          className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {token.logoURI ? (
            <motion.img
              src={token.logoURI}
              alt={token.symbol}
              className="w-6 h-6 rounded-full flex-shrink-0"
              whileHover={{ scale: 1.1, rotate: 5 }}
            />
          ) : (
            <motion.div
              className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 relative"
              whileHover={{ scale: 1.1 }}
            >
              <span className="relative z-10">{token.symbol.slice(0, 2)}</span>
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          )}
          <span className="text-white font-medium whitespace-nowrap">{token.symbol}</span>
          <ChevronDown className="w-4 h-4 text-white/50 flex-shrink-0" />
        </motion.button>
      </div>

      <motion.div
        className="mt-2 text-sm text-white/40 tabular-nums"
        key={usdValue}
        initial={{ opacity: 0, x: -5 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        ${usdValue}
      </motion.div>
    </div>
  )
}

export default TokenInputField
