import { useState, useCallback } from 'react'
import { useAccount } from 'wagmi'
import { motion } from 'framer-motion'
import { ArrowDownUp, AlertCircle, Info } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { TokenInput } from './token-input'
import { TokenSelectModal } from './token-select-modal'
import { SwapSettings } from './swap-settings'
import { TxStatusModal, type TxStatus } from './tx-status-modal'
import { ConnectButton } from './connect-button'
import {
  TOKENS,
  DEFAULT_FROM_TOKEN,
  DEFAULT_TO_TOKEN,
  IS_DEMO_MODE,
  type Token,
} from '@/constants/tokens'
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
 * @example
 * <SwapCard />
 */
export function SwapCard({ className }: SwapCardProps) {
  const { isConnected } = useAccount()

  // Token state
  const [fromToken, setFromToken] = useState<Token>(DEFAULT_FROM_TOKEN)
  const [toToken, setToToken] = useState<Token>(DEFAULT_TO_TOKEN)
  const [fromAmount, setFromAmount] = useState('')
  const [toAmount, setToAmount] = useState('')

  // UI state
  const [selectingToken, setSelectingToken] = useState<'from' | 'to' | null>(null)
  const [slippage, setSlippage] = useState(0.5)
  const [deadline, setDeadline] = useState(20)

  // Transaction state
  const [txStatus, setTxStatus] = useState<TxStatus>('idle')
  const [txHash, setTxHash] = useState<string>()
  const [showTxModal, setShowTxModal] = useState(false)

  // Calculate mock exchange rate
  const exchangeRate = 1.5 // Mock rate: 1 0G = 1.5 USDCe
  const priceImpact = 0.15 // Mock price impact

  // Update toAmount when fromAmount changes (mock calculation)
  const handleFromAmountChange = useCallback((value: string) => {
    setFromAmount(value)
    if (value && !isNaN(parseFloat(value))) {
      const calculated = (parseFloat(value) * exchangeRate).toFixed(6)
      setToAmount(calculated)
    } else {
      setToAmount('')
    }
  }, [exchangeRate])

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
        // Swap tokens if selecting the same
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
  }

  // Demo swap function
  const handleSwap = async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) return

    setShowTxModal(true)
    setTxStatus('pending')

    // Simulate transaction
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock success (in demo mode)
    setTxHash('0x' + Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2))
    setTxStatus('success')

    // Reset form
    setFromAmount('')
    setToAmount('')
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
            {IS_DEMO_MODE && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-yellow-500/20 text-yellow-400 text-xs">
                <AlertCircle className="w-3 h-3" />
                Demo
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
        {fromAmount && parseFloat(fromAmount) > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-3 rounded-xl bg-white/5 space-y-2"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/50">Rate</span>
              <span className="text-white">
                1 {fromToken.symbol} = {exchangeRate} {toToken.symbol}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-white/50">
                Price Impact
                <Info className="w-3 h-3" />
              </div>
              <span className={cn(
                priceImpact > 3 ? 'text-accent-red' : 'text-white'
              )}>
                {priceImpact}%
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/50">Slippage</span>
              <span className="text-white">{slippage}%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/50">Min. received</span>
              <span className="text-white">
                {(parseFloat(toAmount) * (1 - slippage / 100)).toFixed(6)} {toToken.symbol}
              </span>
            </div>
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
              disabled={!isValidSwap}
              className="w-full"
            >
              {!fromAmount || parseFloat(fromAmount) <= 0
                ? 'Enter amount'
                : fromToken.symbol === toToken.symbol
                ? 'Select different tokens'
                : IS_DEMO_MODE
                ? 'Swap (Demo)'
                : 'Swap'}
            </GlassButton>
          )}
        </div>

        {/* Demo Notice */}
        {IS_DEMO_MODE && isConnected && (
          <p className="mt-3 text-xs text-white/40 text-center">
            This is a demo. No real tokens will be swapped.
          </p>
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
        tokens={TOKENS}
      />

      {/* Transaction Status Modal */}
      <TxStatusModal
        isOpen={showTxModal}
        onClose={() => {
          setShowTxModal(false)
          setTxStatus('idle')
        }}
        status={txStatus}
        txHash={txHash}
        title={txStatus === 'pending' ? 'Swapping Tokens' : undefined}
        message={
          txStatus === 'success'
            ? `Successfully swapped ${fromAmount} ${fromToken.symbol} for ${toAmount} ${toToken.symbol}`
            : undefined
        }
      />
    </>
  )
}

export default SwapCard
