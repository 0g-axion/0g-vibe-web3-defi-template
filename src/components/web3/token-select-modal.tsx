/**
 * TokenSelectModal Component
 *
 * Anchor-positioned modal for token selection with search.
 * Uses smart positioning based on anchor element location.
 */
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search } from 'lucide-react'
import type { Token } from '@/constants/tokens'
import { cn } from '@/lib/utils'

export interface TokenSelectModalProps {
  /** Is modal open */
  isOpen: boolean
  /** Close handler */
  onClose: () => void
  /** Token select handler */
  onSelect: (token: Token) => void
  /** Available tokens */
  tokens: Token[]
  /** Currently selected token */
  selectedToken: Token
  /** Anchor element rect for positioning (optional - uses centered modal if not provided) */
  anchorRect?: DOMRect | null
  /** @deprecated Tokens to exclude from list (backward compatibility) */
  excludeTokens?: string[]
}

/**
 * TokenSelectModal Component
 *
 * Positioned modal for token selection with search and popular tokens.
 *
 * @example
 * <TokenSelectModal
 *   isOpen={selectingToken !== null}
 *   onClose={() => setSelectingToken(null)}
 *   onSelect={handleTokenSelect}
 *   tokens={tokens}
 *   selectedToken={fromToken}
 *   anchorRect={anchorRect}
 * />
 */
export function TokenSelectModal({
  isOpen,
  onClose,
  onSelect,
  tokens,
  selectedToken,
  anchorRect,
  excludeTokens = []
}: TokenSelectModalProps) {
  const [search, setSearch] = useState('')

  const filteredTokens = tokens
    .filter(token => !excludeTokens.includes(token.symbol))
    .filter(token =>
      token.name.toLowerCase().includes(search.toLowerCase()) ||
      token.symbol.toLowerCase().includes(search.toLowerCase())
    )

  // Calculate position based on anchor
  const modalStyle = useMemo(() => {
    if (!anchorRect) return {}

    const modalWidth = 384 // max-w-sm = 384px
    const modalHeight = 480 // approximate height
    const padding = 8

    // Position to the left of the anchor, aligned with its top
    let left = anchorRect.left - modalWidth - padding
    let top = anchorRect.top

    // If not enough space on left, position below the anchor
    if (left < padding) {
      left = anchorRect.right - modalWidth
      top = anchorRect.bottom + padding
    }

    // If still overflowing left, align to left edge
    if (left < padding) {
      left = padding
    }

    // If overflowing right
    if (left + modalWidth > window.innerWidth - padding) {
      left = window.innerWidth - modalWidth - padding
    }

    // If overflowing bottom, position above
    if (top + modalHeight > window.innerHeight - padding) {
      top = Math.max(padding, anchorRect.top - modalHeight - padding)
    }

    return { left, top }
  }, [anchorRect])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="fixed z-50 w-full max-w-sm"
            style={modalStyle}
          >
            <div className="bg-[#12121a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                <h2 className="text-base font-semibold text-white">Select Token</h2>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search */}
              <div className="p-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="text"
                    placeholder="Search by name or symbol"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    autoFocus
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/30 outline-none focus:border-violet-500/50 transition-colors"
                  />
                </div>
              </div>

              {/* Popular Tokens */}
              <div className="px-3 pb-2">
                <div className="flex flex-wrap gap-1.5">
                  {tokens.slice(0, 4).map((token) => (
                    <button
                      key={token.symbol}
                      onClick={() => {
                        onSelect(token)
                        setSearch('')
                      }}
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs transition-colors",
                        selectedToken.symbol === token.symbol
                          ? "bg-violet-500/20 border-violet-500/50 text-white"
                          : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                      )}
                    >
                      {token.logoURI ? (
                        <img src={token.logoURI} alt={token.symbol} className="w-4 h-4 rounded-full" />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500" />
                      )}
                      <span className="font-medium">{token.symbol}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Token List */}
              <div className="px-2 pb-3 max-h-[240px] overflow-y-auto">
                {filteredTokens.map((token) => (
                  <button
                    key={token.address}
                    onClick={() => {
                      onSelect(token)
                      setSearch('')
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 p-2.5 rounded-xl transition-colors",
                      selectedToken.symbol === token.symbol
                        ? "bg-violet-500/10"
                        : "hover:bg-white/5"
                    )}
                  >
                    {token.logoURI ? (
                      <img src={token.logoURI} alt={token.symbol} className="w-8 h-8 rounded-full" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-xs font-bold text-white">
                        {token.symbol.slice(0, 2)}
                      </div>
                    )}
                    <div className="flex-1 text-left">
                      <div className="text-white text-sm font-medium">{token.name}</div>
                      <div className="text-white/50 text-xs">{token.symbol}</div>
                    </div>
                    {selectedToken.symbol === token.symbol && (
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                    )}
                  </button>
                ))}

                {filteredTokens.length === 0 && (
                  <div className="text-center py-6 text-white/50 text-sm">
                    No tokens found
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default TokenSelectModal
