import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search } from 'lucide-react'
import { TokenIcon } from './token-icon'
import { GlassInput } from '@/components/ui/glass-input'
import { TOKENS, type Token } from '@/constants/tokens'
import { cn } from '@/lib/utils'

export interface TokenSelectModalProps {
  /** Is modal open */
  isOpen: boolean
  /** Close handler */
  onClose: () => void
  /** Token select handler */
  onSelect: (token: Token) => void
  /** Currently selected token */
  selectedToken?: Token
  /** Tokens to exclude from list */
  excludeTokens?: string[]
  /** Available tokens (defaults to all) */
  tokens?: Token[]
}

/**
 * TokenSelectModal Component
 *
 * Full-screen modal for token selection with search.
 *
 * @example
 * <TokenSelectModal
 *   isOpen={showModal}
 *   onClose={() => setShowModal(false)}
 *   onSelect={handleTokenSelect}
 *   excludeTokens={['ETH']}
 * />
 */
export function TokenSelectModal({
  isOpen,
  onClose,
  onSelect,
  selectedToken,
  excludeTokens = [],
  tokens = TOKENS,
}: TokenSelectModalProps) {
  const [search, setSearch] = useState('')

  const filteredTokens = useMemo(() => {
    const available = tokens.filter((t) => !excludeTokens.includes(t.symbol))

    if (!search) return available

    const query = search.toLowerCase()
    return available.filter(
      (t) =>
        t.symbol.toLowerCase().includes(query) ||
        t.name.toLowerCase().includes(query)
    )
  }, [tokens, excludeTokens, search])

  const handleSelect = (token: Token) => {
    onSelect(token)
    setSearch('')
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50',
              'w-full max-w-md max-h-[80vh]',
              'rounded-2xl overflow-hidden',
              'bg-background-mid/95 backdrop-blur-xl',
              'border border-white/10',
              'shadow-2xl shadow-black/30'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white">Select Token</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-white/10">
              <GlassInput
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or symbol"
                leftAddon={<Search className="w-4 h-4" />}
                inputSize="md"
              />
            </div>

            {/* Token List */}
            <div className="overflow-auto max-h-[400px] p-2">
              {filteredTokens.length > 0 ? (
                <div className="space-y-1">
                  {filteredTokens.map((token) => (
                    <button
                      key={token.symbol}
                      onClick={() => handleSelect(token)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-3 rounded-xl',
                        'hover:bg-white/10 transition-colors',
                        'text-left',
                        selectedToken?.symbol === token.symbol &&
                          'bg-primary-500/20 border border-primary-500/30'
                      )}
                    >
                      <TokenIcon
                        symbol={token.symbol}
                        src={token.logoURI}
                        size={40}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">
                            {token.symbol}
                          </span>
                          {token.isNative && (
                            <span className="px-1.5 py-0.5 text-[10px] rounded bg-primary-500/30 text-primary-300">
                              Native
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-white/50 truncate">
                          {token.name}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-white/50">No tokens found</p>
                  <p className="text-sm text-white/30 mt-1">
                    Try a different search term
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default TokenSelectModal
