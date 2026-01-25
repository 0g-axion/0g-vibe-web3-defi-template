/**
 * @deprecated This component is deprecated. Use SwapPanel from './swap-panel' instead.
 * SwapPanel has the new premium UI design while preserving the real swap functionality.
 * This file is kept for reference only.
 */
import { useState, useCallback, useEffect } from 'react'
import { useAccount, useChainId } from 'wagmi'
import { motion } from 'framer-motion'
import { ArrowDownUp, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { TokenInput } from './token-input'
import { TokenSelectModal } from './token-select-modal'
import { SwapSettings } from './swap-settings'
import { TxStatusModal, type TxStatus } from './tx-status-modal'
import { ConnectButton } from './connect-button'
import { useSwap } from '@/hooks/useSwap'
import {
  getTokens,
  getDefaultTokenPair,
  type Token,
} from '@/constants/tokens'
import { hasDexSupport, CHAIN_IDS } from '@/config/chains'
import { cn } from '@/lib/utils'

export interface SwapCardProps {
  className?: string
}

/**
 * SwapCard Component
 *
 * Complete swap interface with token selection, amount inputs,
 * settings, and transaction status.
 *
 * Network-aware:
 * - Mainnet (16661): Real swaps via Janie DEX
 * - Testnet (16602): Demo mode (simulated)
 *
 * @example
 * <SwapCard />
 */
export function SwapCard({ className }: SwapCardProps) {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { status, error, txHash, getQuote, executeSwap, reset } = useSwap()

  // Get network-aware token list and defaults
  const tokens = getTokens(chainId)
  const defaultPair = getDefaultTokenPair(chainId)
  const isDemoMode = !hasDexSupport(chainId)
  const isMainnet = chainId === CHAIN_IDS.MAINNET

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
  const [slippage, setSlippage] = useState(0.5)
  const [deadline, setDeadline] = useState(20)
  const [showTxModal, setShowTxModal] = useState(false)

  // Update tokens when chain changes
  useEffect(() => {
    const newDefaultPair = getDefaultTokenPair(chainId)

    // Reset to default tokens for new chain
    setFromToken(newDefaultPair.from)
    setToToken(newDefaultPair.to)
    setFromAmount('')
    setToAmount('')
  }, [chainId])

  // Update toAmount when fromAmount changes (fetch quote)
  const handleFromAmountChange = useCallback(
    async (value: string) => {
      setFromAmount(value)

      if (!value || parseFloat(value) <= 0) {
        setToAmount('')
        setExchangeRate(0)
        setPriceImpact(0)
        return
      }

      // Get quote
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

  // Switch tokens
  const handleSwitchTokens = () => {
    setFromToken(toToken)
    setToToken(fromToken)
    setFromAmount(toAmount)
    setToAmount(fromAmount)
  }

  // Handle token selection
  const handleTokenSelect = (token: Token) => {
    if (selectingToken === 'from') {
      if (token.symbol === toToken.symbol) {
        setToToken(fromToken)
      }
      setFromToken(token)
    } else {
      if (token.symbol === fromToken.symbol) {
        setFromToken(toToken)
      }
      setToToken(token)
    }
    setSelectingToken(null)

    // Refresh quote
    if (fromAmount && parseFloat(fromAmount) > 0) {
      handleFromAmountChange(fromAmount)
    }
  }

  // Execute swap
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

  const isValidSwap =
    fromAmount &&
    parseFloat(fromAmount) > 0 &&
    fromToken.symbol !== toToken.symbol

  return (
    <>
      <GlassCard className={cn('w-full max-w-md p-4', className)}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Swap</h2>
          <div className="flex items-center gap-2">
            {isDemoMode && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-yellow-500/20 text-yellow-400 text-xs">
                <AlertCircle className="w-3 h-3" />
                Demo
              </div>
            )}
            {isMainnet && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-green-500/20 text-green-400 text-xs">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Live
              </div>
            )}
            <SwapSettings
              slippage={slippage}
              onSlippageChange={setSlippage}
              deadline={deadline}
              onDeadlineChange={setDeadline}
            />
          </div>
        </div>

        {/* Mainnet Warning */}
        {isMainnet && isConnected && (
          <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-200/80">
                You're on <strong>mainnet</strong>. Swaps use real tokens and gas.
              </p>
            </div>
          </div>
        )}

        {/* From Token Input */}
        <TokenInput
          value={fromAmount}
          onChange={handleFromAmountChange}
          token={fromToken}
          onTokenClick={() => setSelectingToken('from')}
          label="You pay"
          showBalance
          showMax
        />

        {/* Switch Button */}
        <div className="relative h-0 flex items-center justify-center z-10">
          <motion.button
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSwitchTokens}
            className={cn(
              'absolute p-2 rounded-xl',
              'bg-background-mid border-4 border-background-start',
              'hover:bg-primary-500/20 transition-colors',
              '-my-3'
            )}
          >
            <ArrowDownUp className="w-5 h-5 text-white" />
          </motion.button>
        </div>

        {/* To Token Input */}
        <TokenInput
          value={toAmount}
          onChange={setToAmount}
          token={toToken}
          onTokenClick={() => setSelectingToken('to')}
          label="You receive"
          showBalance={false}
          showMax={false}
          disabled
          className="mt-1"
        />

        {/* Swap Details */}
        {fromAmount && parseFloat(fromAmount) > 0 && exchangeRate > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-3 rounded-xl bg-white/5 space-y-2"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/50">Rate</span>
              <span className="text-white">
                1 {fromToken.symbol} = {exchangeRate.toFixed(4)} {toToken.symbol}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-white/50">
                Price Impact
                <Info className="w-3 h-3" />
              </div>
              <span
                className={cn(priceImpact > 3 ? 'text-accent-red' : 'text-white')}
              >
                {priceImpact.toFixed(2)}%
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/50">Slippage</span>
              <span className="text-white">{slippage}%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/50">Min. received</span>
              <span className="text-white">
                {(parseFloat(toAmount) * (1 - slippage / 100)).toFixed(6)}{' '}
                {toToken.symbol}
              </span>
            </div>
            {!isDemoMode && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/50">Network fee</span>
                <span className="text-white/70">~0.001 0G</span>
              </div>
            )}
          </motion.div>
        )}

        {/* Action Button */}
        <div className="mt-4">
          {!isConnected ? (
            <ConnectButton className="w-full justify-center" />
          ) : (
            <GlassButton
              variant="primary"
              size="lg"
              onClick={handleSwap}
              disabled={!isValidSwap || status === 'swapping' || status === 'approving'}
              className="w-full"
            >
              {status === 'approving'
                ? 'Approving...'
                : status === 'swapping'
                ? 'Swapping...'
                : !fromAmount || parseFloat(fromAmount) <= 0
                ? 'Enter amount'
                : fromToken.symbol === toToken.symbol
                ? 'Select different tokens'
                : isDemoMode
                ? 'Swap (Demo)'
                : 'Swap'}
            </GlassButton>
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
      </GlassCard>

      {/* Token Select Modal */}
      <TokenSelectModal
        isOpen={selectingToken !== null}
        onClose={() => setSelectingToken(null)}
        onSelect={handleTokenSelect}
        selectedToken={selectingToken === 'from' ? fromToken : toToken}
        excludeTokens={
          selectingToken === 'from' ? [toToken.symbol] : [fromToken.symbol]
        }
        tokens={tokens}
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

export default SwapCard
