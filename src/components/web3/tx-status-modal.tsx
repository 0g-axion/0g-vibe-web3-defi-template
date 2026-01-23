import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, CheckCircle2, XCircle, ExternalLink } from 'lucide-react'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassCard } from '@/components/ui/glass-card'
import { getExplorerUrl } from '@/lib/utils'
import { cn } from '@/lib/utils'

export type TxStatus = 'idle' | 'pending' | 'success' | 'error'

export interface TxStatusModalProps {
  /** Is modal open */
  isOpen: boolean
  /** Close handler */
  onClose: () => void
  /** Current status */
  status: TxStatus
  /** Transaction hash */
  txHash?: string
  /** Title text */
  title?: string
  /** Description/message */
  message?: string
  /** Error message */
  error?: string
}

const statusConfig = {
  idle: {
    icon: null,
    color: 'text-white',
    bgColor: 'bg-white/10',
    animate: false,
  },
  pending: {
    icon: Loader2,
    color: 'text-primary-400',
    bgColor: 'bg-primary-500/20',
    animate: true,
  },
  success: {
    icon: CheckCircle2,
    color: 'text-accent-green',
    bgColor: 'bg-accent-green/20',
    animate: false,
  },
  error: {
    icon: XCircle,
    color: 'text-accent-red',
    bgColor: 'bg-accent-red/20',
    animate: false,
  },
}

/**
 * TxStatusModal Component
 *
 * Modal showing transaction status (pending, success, error).
 *
 * @example
 * <TxStatusModal
 *   isOpen={showStatus}
 *   onClose={() => setShowStatus(false)}
 *   status="pending"
 *   txHash="0x..."
 *   title="Swapping Tokens"
 *   message="Please wait while your transaction is being processed"
 * />
 */
export function TxStatusModal({
  isOpen,
  onClose,
  status,
  txHash,
  title,
  message,
  error,
}: TxStatusModalProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  const defaultTitles = {
    idle: 'Transaction',
    pending: 'Transaction Pending',
    success: 'Transaction Successful',
    error: 'Transaction Failed',
  }

  const defaultMessages = {
    idle: '',
    pending: 'Please wait while your transaction is being processed...',
    success: 'Your transaction has been confirmed!',
    error: 'Something went wrong. Please try again.',
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
            onClick={status !== 'pending' ? onClose : undefined}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm"
          >
            <GlassCard className="p-6">
              {/* Close button (only when not pending) */}
              {status !== 'pending' && (
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white/50" />
                </button>
              )}

              {/* Icon */}
              {Icon && (
                <div
                  className={cn(
                    'w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center',
                    config.bgColor
                  )}
                >
                  <Icon
                    className={cn(
                      'w-8 h-8',
                      config.color,
                      config.animate && 'animate-spin'
                    )}
                  />
                </div>
              )}

              {/* Title */}
              <h2 className="text-xl font-semibold text-white text-center mb-2">
                {title || defaultTitles[status]}
              </h2>

              {/* Message */}
              <p className="text-white/60 text-center mb-6">
                {error || message || defaultMessages[status]}
              </p>

              {/* Transaction Hash Link */}
              {txHash && (
                <a
                  href={getExplorerUrl(txHash, 'tx')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'flex items-center justify-center gap-2',
                    'text-sm text-primary-400 hover:text-primary-300',
                    'transition-colors mb-4'
                  )}
                >
                  View on Explorer
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}

              {/* Action Button */}
              {status !== 'pending' && (
                <GlassButton
                  variant={status === 'success' ? 'primary' : 'default'}
                  onClick={onClose}
                  className="w-full"
                >
                  {status === 'success' ? 'Done' : 'Close'}
                </GlassButton>
              )}
            </GlassCard>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default TxStatusModal
