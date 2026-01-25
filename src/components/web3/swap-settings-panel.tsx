/**
 * SwapSettingsPanel Component
 *
 * Inline swap settings panel (new premium design).
 * Shows slippage tolerance settings in an expandable panel.
 */
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SwapSettingsPanelProps {
  slippage: number
  onSlippageChange: (value: number) => void
  deadline?: number
  onDeadlineChange?: (value: number) => void
  onClose: () => void
}

const PRESET_SLIPPAGES = [0.1, 0.5, 1.0]

export function SwapSettingsPanel({
  slippage,
  onSlippageChange,
  deadline = 20,
  onDeadlineChange,
  onClose
}: SwapSettingsPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mb-4 p-4 rounded-2xl bg-white/5 border border-white/10"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-medium">Transaction Settings</h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Slippage */}
      <div>
        <label className="text-sm text-white/50 mb-2 block">Slippage Tolerance</label>
        <div className="flex items-center gap-2">
          {PRESET_SLIPPAGES.map((preset) => (
            <button
              key={preset}
              onClick={() => onSlippageChange(preset)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                slippage === preset
                  ? "bg-violet-500 text-white"
                  : "bg-white/10 text-white/70 hover:bg-white/15"
              )}
            >
              {preset}%
            </button>
          ))}
          <div className="relative flex-1">
            <input
              type="number"
              value={slippage}
              onChange={(e) => onSlippageChange(parseFloat(e.target.value) || 0.5)}
              className="w-full bg-white/10 border border-white/10 rounded-xl py-2 px-3 text-white text-sm outline-none focus:border-violet-500/50 transition-colors"
              step="0.1"
              min="0.1"
              max="50"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 text-sm">%</span>
          </div>
        </div>
        {slippage > 5 && (
          <p className="mt-2 text-xs text-amber-400">
            High slippage may result in unfavorable trades
          </p>
        )}
      </div>

      {/* Transaction Deadline */}
      {onDeadlineChange && (
        <div className="mt-4">
          <label className="text-sm text-white/50 mb-2 block">Transaction Deadline</label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="number"
                value={deadline}
                onChange={(e) => onDeadlineChange(parseInt(e.target.value) || 20)}
                className="w-full bg-white/10 border border-white/10 rounded-xl py-2 px-3 text-white text-sm outline-none focus:border-violet-500/50 transition-colors"
                step="1"
                min="1"
                max="60"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 text-sm">min</span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default SwapSettingsPanel
