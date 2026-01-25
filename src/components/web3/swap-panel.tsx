import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAccount, useChainId } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { ArrowDown, Settings2, RefreshCw, Info, Fuel, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getTokens, getDefaultTokenPair, type Token } from '@/constants/tokens'
import { hasDexSupport, CHAIN_IDS } from '@/config/chains'
import { useSwap } from '@/hooks/useSwap'
import { useFeatures } from '@/providers/feature-provider'
import { TokenInputField } from './token-input-field'
import { TokenSelectModal } from './token-select-modal'
import { SwapSettingsPanel } from './swap-settings-panel'
import { TxStatusModal, type TxStatus } from './tx-status-modal'

export function SwapPanel() {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const features = useFeatures()

  const tokens = getTokens(chainId)
  const defaultPair = getDefaultTokenPair(chainId)
  const isDemoMode = !hasDexSupport(chainId)
  const isMainnet = chainId === CHAIN_IDS.MAINNET

  // Real swap hook
  const { status, error, txHash, getQuote, executeSwap, reset } = useSwap()

  // Token state
  const [fromToken, setFromToken] = useState<Token>(defaultPair.from)
  const [toToken, setToToken] = useState<Token>(defaultPair.to)
  const [fromAmount, setFromAmount] = useState('')
  const [toAmount, setToAmount] = useState('')

  // Quote state
  const [exchangeRate, setExchangeRate] = useState<number>(0)
  const [priceImpact, setPriceImpact] = useState<number>(0)

  // UI state
  const [selectingToken, setSelectingToken] = useState<'from' | 'to' | null>(null)
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [slippage, setSlippage] = useState(0.5)
  const [deadline, setDeadline] = useState(20)
  const [showTxModal, setShowTxModal] = useState(false)

  // Update tokens when chain changes
  useEffect(() => {
    const newPair = getDefaultTokenPair(chainId)
    setFromToken(newPair.from)
    setToToken(newPair.to)
    setFromAmount('')
    setToAmount('')
  }, [chainId])

  // Fetch real quote when amount changes
  const handleFromAmountChange = useCallback(
    async (value: string) => {
      setFromAmount(value)

      if (!value || parseFloat(value) <= 0) {
        setToAmount('')
        setExchangeRate(0)
        setPriceImpact(0)
        return
      }

      // Get real quote from DEX
      const quote = await getQuote({
        tokenIn: fromToken,
        tokenOut: toToken,
        amountIn: value,
      })

      if (quote) {
        setToAmount(quote.amountOut)
        setExchangeRate(quote.rate)
        setPriceImpact(quote.priceImpact)
      }
    },
    [fromToken, toToken, getQuote]
  )

  const handleSwitch = useCallback(() => {
    const newFromToken = toToken
    const newToToken = fromToken
    const newFromAmount = toAmount
    setFromToken(newFromToken)
    setToToken(newToToken)
    setFromAmount(newFromAmount)
    // Trigger quote refresh with new tokens
    if (newFromAmount && parseFloat(newFromAmount) > 0) {
      getQuote({
        tokenIn: newFromToken,
        tokenOut: newToToken,
        amountIn: newFromAmount,
      }).then(quote => {
        if (quote) {
          setToAmount(quote.amountOut)
          setExchangeRate(quote.rate)
          setPriceImpact(quote.priceImpact)
        }
      })
    } else {
      setToAmount('')
    }
  }, [fromToken, toToken, toAmount, getQuote])

  const handleTokenSelect = (token: Token) => {
    if (selectingToken === 'from') {
      if (token.symbol === toToken.symbol) {
        handleSwitch()
      } else {
        setFromToken(token)
        // Refresh quote with new token
        if (fromAmount && parseFloat(fromAmount) > 0) {
          getQuote({
            tokenIn: token,
            tokenOut: toToken,
            amountIn: fromAmount,
          }).then(quote => {
            if (quote) {
              setToAmount(quote.amountOut)
              setExchangeRate(quote.rate)
              setPriceImpact(quote.priceImpact)
            }
          })
        }
      }
    } else {
      if (token.symbol === fromToken.symbol) {
        handleSwitch()
      } else {
        setToToken(token)
        // Refresh quote with new token
        if (fromAmount && parseFloat(fromAmount) > 0) {
          getQuote({
            tokenIn: fromToken,
            tokenOut: token,
            amountIn: fromAmount,
          }).then(quote => {
            if (quote) {
              setToAmount(quote.amountOut)
              setExchangeRate(quote.rate)
              setPriceImpact(quote.priceImpact)
            }
          })
        }
      }
    }
    setSelectingToken(null)
  }

  const handleSwap = async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) return

    setShowTxModal(true)

    const result = await executeSwap({
      tokenIn: fromToken,
      tokenOut: toToken,
      amountIn: fromAmount,
      slippagePercent: slippage,
      deadlineMinutes: deadline,
    })

    if (result) {
      // Reset form on success
      setFromAmount('')
      setToAmount('')
      setExchangeRate(0)
      setPriceImpact(0)
    }
  }

  // Map hook status to modal status
  const getTxStatus = (): TxStatus => {
    if (status === 'approving') return 'pending'
    if (status === 'swapping') return 'pending'
    if (status === 'success') return 'success'
    if (status === 'error') return 'error'
    return 'idle'
  }

  const isSwapInProgress = status === 'approving' || status === 'swapping'

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
              <SwapSettingsPanel
                slippage={slippage}
                onSlippageChange={setSlippage}
                deadline={deadline}
                onDeadlineChange={setDeadline}
                onClose={() => setShowSettings(false)}
              />
            )}

            {/* Mainnet Warning */}
            {features.ui.showMainnetWarning && isMainnet && isConnected && (
              <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-200/80">
                    You're on <strong>mainnet</strong>. Swaps use real tokens and gas.
                  </p>
                </div>
              </div>
            )}

            {/* From Token */}
            <TokenInputField
              label="You pay"
              token={fromToken}
              value={fromAmount}
              onChange={handleFromAmountChange}
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
            {isValidSwap && exchangeRate > 0 && (
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
                      1 {fromToken.symbol} = {exchangeRate.toFixed(6)} {toToken.symbol}
                    </motion.span>
                    <motion.button
                      onClick={() => handleFromAmountChange(fromAmount)}
                      className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                      whileHover={{ rotate: 180 }}
                      transition={{ duration: 0.3 }}
                    >
                      <RefreshCw className="w-3 h-3 text-white/50" />
                    </motion.button>
                  </div>
                </div>
                {features.swap.showPriceImpact && (
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-white/50">
                      <span>Price Impact</span>
                      <Info className="w-3 h-3" />
                    </div>
                    <span className={cn(
                      "flex items-center gap-1",
                      priceImpact > 3 ? "text-red-400" : priceImpact > 1 ? "text-amber-400" : "text-emerald-400"
                    )}>
                      <span className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        priceImpact > 3 ? "bg-red-400" : priceImpact > 1 ? "bg-amber-400" : "bg-emerald-400"
                      )} />
                      {priceImpact < 0.01 ? '<0.01' : priceImpact.toFixed(2)}%
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50">Slippage</span>
                  <span className="text-white">{slippage}%</span>
                </div>
                {features.swap.showMinReceived && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/50">Min. received</span>
                    <span className="text-white">
                      {(parseFloat(toAmount) * (1 - slippage / 100)).toFixed(6)} {toToken.symbol}
                    </span>
                  </div>
                )}
                {features.swap.showNetworkFee && !isDemoMode && (
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-white/50">
                      <Fuel className="w-3 h-3" />
                      <span>Network Fee</span>
                    </div>
                    <span className="text-white/70">~0.001 0G</span>
                  </div>
                )}
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
                  disabled={!isValidSwap || isSwapInProgress}
                  className={cn(
                    "w-full py-4 rounded-2xl font-semibold transition-all relative overflow-hidden",
                    isValidSwap && !isSwapInProgress
                      ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
                      : "bg-white/5 text-white/30 cursor-not-allowed"
                  )}
                  whileHover={isValidSwap && !isSwapInProgress ? { scale: 1.01 } : {}}
                  whileTap={isValidSwap && !isSwapInProgress ? { scale: 0.99 } : {}}
                  animate={isValidSwap && !isSwapInProgress ? {
                    boxShadow: [
                      "0 10px 40px -10px rgba(139, 92, 246, 0.3)",
                      "0 10px 40px -10px rgba(139, 92, 246, 0.5)",
                      "0 10px 40px -10px rgba(139, 92, 246, 0.3)"
                    ]
                  } : {}}
                  transition={isValidSwap && !isSwapInProgress ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : {}}
                >
                  {status === 'approving' ? (
                    <span className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Approving...
                    </span>
                  ) : status === 'swapping' ? (
                    <span className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Swapping...
                    </span>
                  ) : !fromAmount || parseFloat(fromAmount) <= 0 ? (
                    'Enter amount'
                  ) : fromToken.symbol === toToken.symbol ? (
                    'Select different tokens'
                  ) : isDemoMode ? (
                    'Swap (Demo)'
                  ) : (
                    'Swap'
                  )}
                </motion.button>
              )}
            </div>

            {/* Demo Notice */}
            {isDemoMode && isConnected && (
              <p className="mt-3 text-xs text-white/40 text-center">
                This is a demo on testnet. Switch to mainnet for real swaps.
              </p>
            )}

            {/* Error display */}
            {error && (
              <p className="mt-3 text-xs text-red-400 text-center">{error}</p>
            )}
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

      {/* Transaction Status Modal */}
      <TxStatusModal
        isOpen={showTxModal}
        onClose={() => {
          setShowTxModal(false)
          reset()
        }}
        status={getTxStatus()}
        txHash={txHash || undefined}
        chainId={chainId}
        title={
          status === 'approving'
            ? 'Approving Token'
            : status === 'swapping'
            ? 'Swapping Tokens'
            : undefined
        }
        message={
          status === 'success'
            ? `Successfully swapped ${fromAmount} ${fromToken.symbol} for ${toAmount} ${toToken.symbol}`
            : status === 'error'
            ? error || 'Transaction failed'
            : undefined
        }
      />
    </>
  )
}

export default SwapPanel
