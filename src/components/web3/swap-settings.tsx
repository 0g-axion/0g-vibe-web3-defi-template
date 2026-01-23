import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, X, Info } from 'lucide-react'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassInput } from '@/components/ui/glass-input'
import { cn } from '@/lib/utils'

export interface SwapSettingsProps {
  /** Current slippage value */
  slippage: number
  /** Slippage change handler */
  onSlippageChange: (value: number) => void
  /** Current deadline in minutes */
  deadline: number
  /** Deadline change handler */
  onDeadlineChange: (value: number) => void
  className?: string
}

const SLIPPAGE_PRESETS = [0.5, 1, 3]

/**
 * SwapSettings Component
 *
 * Popover for swap settings like slippage and deadline.
 *
 * @example
 * <SwapSettings
 *   slippage={slippage}
 *   onSlippageChange={setSlippage}
 *   deadline={deadline}
 *   onDeadlineChange={setDeadline}
 * />
 */
export function SwapSettings({
  slippage,
  onSlippageChange,
  deadline,
  onDeadlineChange,
  className,
}: SwapSettingsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [customSlippage, setCustomSlippage] = useState('')

  const handleSlippagePreset = (value: number) => {
    onSlippageChange(value)
    setCustomSlippage('')
  }

  const handleCustomSlippage = (value: string) => {
    setCustomSlippage(value)
    const num = parseFloat(value)
    if (!isNaN(num) && num > 0 && num <= 50) {
      onSlippageChange(num)
    }
  }

  const isHighSlippage = slippage > 5
  const isLowSlippage = slippage < 0.1

  return (
    <div className={cn('relative', className)}>
      {/* Trigger */}
      <GlassButton
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          '!p-2',
          isOpen && 'bg-white/10'
        )}
      >
        <Settings className="w-5 h-5" />
      </GlassButton>

      {/* Popover */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className={cn(
                'absolute right-0 top-full mt-2 z-50',
                'w-[320px] p-4 rounded-2xl',
                'bg-background-mid/95 backdrop-blur-xl',
                'border border-white/10',
                'shadow-xl shadow-black/30'
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">Swap Settings</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4 text-white/50" />
                </button>
              </div>

              {/* Slippage */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-medium text-white">
                    Slippage Tolerance
                  </span>
                  <div className="group relative">
                    <Info className="w-3.5 h-3.5 text-white/40 cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg bg-black/90 text-xs text-white/70 w-48 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      Your transaction will revert if the price changes more than this percentage.
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {SLIPPAGE_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => handleSlippagePreset(preset)}
                      className={cn(
                        'flex-1 py-2 rounded-xl text-sm font-medium transition-colors',
                        slippage === preset && !customSlippage
                          ? 'bg-primary-500 text-white'
                          : 'bg-white/10 text-white/70 hover:bg-white/15'
                      )}
                    >
                      {preset}%
                    </button>
                  ))}

                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Custom"
                      value={customSlippage}
                      onChange={(e) => handleCustomSlippage(e.target.value)}
                      className={cn(
                        'w-full py-2 px-3 rounded-xl text-sm font-medium',
                        'bg-white/10 text-white placeholder:text-white/40',
                        'outline-none border border-transparent',
                        'focus:border-primary-500 transition-colors',
                        customSlippage && 'border-primary-500'
                      )}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-white/40">
                      %
                    </span>
                  </div>
                </div>

                {/* Warnings */}
                {isHighSlippage && (
                  <p className="mt-2 text-xs text-accent-red">
                    High slippage increases the risk of front-running
                  </p>
                )}
                {isLowSlippage && (
                  <p className="mt-2 text-xs text-yellow-400">
                    Low slippage may cause transaction to fail
                  </p>
                )}
              </div>

              {/* Deadline */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-medium text-white">
                    Transaction Deadline
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <GlassInput
                    type="number"
                    value={deadline.toString()}
                    onChange={(e) => {
                      const num = parseInt(e.target.value)
                      if (!isNaN(num) && num > 0) {
                        onDeadlineChange(num)
                      }
                    }}
                    inputSize="sm"
                    className="!w-20"
                  />
                  <span className="text-sm text-white/50">minutes</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SwapSettings
