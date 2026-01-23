import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAccount, useChainId } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { ArrowDown, Settings2, RefreshCw, Info, Fuel } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getTokens, getDefaultTokenPair, type Token } from '@/constants/tokens'
import { hasDexSupport } from '@/config/chains'
import { TokenInputField } from './TokenInputField'
import { TokenSelectModal } from './TokenSelectModal'
import { SwapSettings } from './SwapSettings'

export function SwapPanel() {
  const { isConnected } = useAccount()
  const chainId = useChainId()

  const tokens = getTokens(chainId)
  const defaultPair = getDefaultTokenPair(chainId)
  const isDemoMode = !hasDexSupport(chainId)

  // Token state
  const [fromToken, setFromToken] = useState<Token>(defaultPair.from)
  const [toToken, setToToken] = useState<Token>(defaultPair.to)
  const [fromAmount, setFromAmount] = useState('')
  const [toAmount, setToAmount] = useState('')

  // UI state
  const [selectingToken, setSelectingToken] = useState<'from' | 'to' | null>(null)
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [slippage, setSlippage] = useState(0.5)
  const [isLoading, setIsLoading] = useState(false)

  // Mock exchange rate
  const [exchangeRate] = useState(1850)

  // Update tokens when chain changes
  useEffect(() => {
    const newPair = getDefaultTokenPair(chainId)
    setFromToken(newPair.from)
    setToToken(newPair.to)
    setFromAmount('')
    setToAmount('')
  }, [chainId])

  // Calculate output amount
  useEffect(() => {
    if (fromAmount && parseFloat(fromAmount) > 0) {
      // Simulate quote calculation
      const rate = fromToken.symbol === '0G' ? exchangeRate : 1 / exchangeRate
      const output = parseFloat(fromAmount) * rate * 0.997 // 0.3% fee
      setToAmount(output.toFixed(6))
    } else {
      setToAmount('')
    }
  }, [fromAmount, fromToken, toToken, exchangeRate])

  const handleSwitch = useCallback(() => {
    setFromToken(toToken)
    setToToken(fromToken)
    setFromAmount(toAmount)
    setToAmount(fromAmount)
  }, [fromToken, toToken, fromAmount, toAmount])

  const handleTokenSelect = (token: Token) => {
    if (selectingToken === 'from') {
      if (token.symbol === toToken.symbol) {
        handleSwitch()
      } else {
        setFromToken(token)
      }
    } else {
      if (token.symbol === fromToken.symbol) {
        handleSwitch()
      } else {
        setToToken(token)
      }
    }
    setSelectingToken(null)
  }

  const handleSwap = async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) return
    setIsLoading(true)
    // Simulate swap
    await new Promise(r => setTimeout(r, 2000))
    setIsLoading(false)
    setFromAmount('')
    setToAmount('')
  }

  const isValidSwap = fromAmount && parseFloat(fromAmount) > 0 && fromToken.symbol !== toToken.symbol

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full"
      >
        {/* Card */}
        <div className="relative rounded-3xl bg-[#12121a] border border-white/5 overflow-hidden">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-violet-500/5 to-transparent pointer-events-none" />

          <div className="relative p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-semibold text-lg">Swap</h2>
              <div className="flex items-center gap-2">
                {isDemoMode && (
                  <span className="px-2 py-1 rounded-lg bg-amber-500/10 text-amber-400 text-xs font-medium">
                    Demo Mode
                  </span>
                )}
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={cn(
                    "p-2 rounded-xl transition-colors",
                    showSettings ? "bg-white/10 text-white" : "text-white/50 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Settings2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
              <SwapSettings
                slippage={slippage}
                onSlippageChange={setSlippage}
                onClose={() => setShowSettings(false)}
              />
            )}

            {/* From Token */}
            <TokenInputField
              label="You pay"
              token={fromToken}
              value={fromAmount}
              onChange={setFromAmount}
              onTokenClick={(rect) => {
                setAnchorRect(rect)
                setSelectingToken('from')
              }}
              showMax
            />

            {/* Switch Button */}
            <div className="relative h-0 flex items-center justify-center z-10 my-1">
              <motion.button
                onClick={handleSwitch}
                className="absolute p-2.5 rounded-xl bg-[#1a1a24] border-4 border-[#12121a] text-white/70 hover:text-white hover:bg-[#22222e] transition-colors group"
                whileHover={{ rotate: 180, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2 }}
                animate={{ y: [0, -2, 0] }}
              >
                <ArrowDown className="w-4 h-4 group-hover:animate-bounce" />
              </motion.button>
            </div>

            {/* To Token */}
            <TokenInputField
              label="You receive"
              token={toToken}
              value={toAmount}
              onChange={() => {}}
              onTokenClick={(rect) => {
                setAnchorRect(rect)
                setSelectingToken('to')
              }}
              disabled
            />

            {/* Swap Details */}
            {isValidSwap && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 p-3 rounded-xl bg-white/5 space-y-2"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50">Rate</span>
                  <div className="flex items-center gap-1 text-white">
                    <motion.span
                      key={exchangeRate}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="tabular-nums"
                    >
                      1 {fromToken.symbol} = {(exchangeRate).toFixed(2)} {toToken.symbol}
                    </motion.span>
                    <motion.button
                      className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                      whileHover={{ rotate: 180 }}
                      transition={{ duration: 0.3 }}
                    >
                      <RefreshCw className="w-3 h-3 text-white/50" />
                    </motion.button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-white/50">
                    <span>Price Impact</span>
                    <Info className="w-3 h-3" />
                  </div>
                  <motion.span
                    className="text-emerald-400 flex items-center gap-1"
                    animate={{ opacity: [1, 0.7, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {'<'}0.01%
                  </motion.span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50">Slippage</span>
                  <span className="text-white">{slippage}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-white/50">
                    <Fuel className="w-3 h-3" />
                    <span>Network Fee</span>
                  </div>
                  <span className="text-white/70">~$0.01</span>
                </div>
              </motion.div>
            )}

            {/* Swap Button */}
            <div className="mt-4">
              {!isConnected ? (
                <ConnectButton.Custom>
                  {({ openConnectModal }) => (
                    <motion.button
                      onClick={openConnectModal}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-shadow"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      Connect Wallet
                    </motion.button>
                  )}
                </ConnectButton.Custom>
              ) : (
                <motion.button
                  onClick={handleSwap}
                  disabled={!isValidSwap || isLoading}
                  className={cn(
                    "w-full py-4 rounded-2xl font-semibold transition-all relative overflow-hidden",
                    isValidSwap
                      ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
                      : "bg-white/5 text-white/30 cursor-not-allowed"
                  )}
                  whileHover={isValidSwap ? { scale: 1.01 } : {}}
                  whileTap={isValidSwap ? { scale: 0.99 } : {}}
                  animate={isValidSwap ? {
                    boxShadow: [
                      "0 10px 40px -10px rgba(139, 92, 246, 0.3)",
                      "0 10px 40px -10px rgba(139, 92, 246, 0.5)",
                      "0 10px 40px -10px rgba(139, 92, 246, 0.3)"
                    ]
                  } : {}}
                  transition={isValidSwap ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : {}}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Swapping...
                    </span>
                  ) : !fromAmount || parseFloat(fromAmount) <= 0 ? (
                    'Enter amount'
                  ) : isDemoMode ? (
                    'Swap (Demo)'
                  ) : (
                    'Swap'
                  )}
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Token Select Modal */}
      <TokenSelectModal
        isOpen={selectingToken !== null}
        onClose={() => {
          setSelectingToken(null)
          setAnchorRect(null)
        }}
        onSelect={handleTokenSelect}
        tokens={tokens}
        selectedToken={selectingToken === 'from' ? fromToken : toToken}
        anchorRect={anchorRect}
      />
    </>
  )
}
