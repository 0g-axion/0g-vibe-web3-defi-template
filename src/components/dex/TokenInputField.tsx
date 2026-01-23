import { useRef } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import type { Token } from '@/constants/tokens'
import { cn } from '@/lib/utils'

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
  const usdValue = value ? (parseFloat(value) * (token.symbol === '0G' ? 0.05 : 1850)).toFixed(2) : '0.00'

  const handleTokenClick = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      onTokenClick(rect)
    }
  }

  return (
    <div className={cn(
      "rounded-2xl p-4 transition-colors overflow-hidden",
      disabled ? "bg-white/[0.02]" : "bg-white/5 hover:bg-white/[0.07]"
    )}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-white/50">{label}</span>
        {showMax && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/50">Balance: 0.00</span>
            <button
              onClick={() => onChange('0')}
              className="text-xs text-violet-400 hover:text-violet-300 font-medium transition-colors"
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
